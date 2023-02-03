import datetime
from typing import Optional

import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from helusers.settings import api_token_auth_settings
from jose import jwt

from shared.common.tests.factories import HelsinkiProfileUserFactory
from users.models import format_date

from .keys import rsa_key

User = get_user_model()


def extract_value(gdpr_api_response: dict, key: str) -> Optional[str]:
    """Extract value from GDPR API response."""
    user: dict = gdpr_api_response["children"]
    return next((item["value"] for item in user if item["key"] == key), None)


def get_api_token_for_user_with_scopes(user, scopes: list, requests_mock):
    """Build a proper auth token with desired scopes."""
    audience = api_token_auth_settings.AUDIENCE
    issuer = api_token_auth_settings.ISSUER
    auth_field = api_token_auth_settings.API_AUTHORIZATION_FIELD
    config_url = f"{issuer}/.well-known/openid-configuration"
    jwks_url = f"{issuer}/jwks"

    configuration = {
        "issuer": issuer,
        "jwks_uri": jwks_url,
    }

    keys = {"keys": [rsa_key.public_key_jwk]}

    now = datetime.datetime.now()
    expire = now + datetime.timedelta(days=14)

    jwt_data = {
        "iss": issuer,
        "sub": str(user.username),
        "aud": audience,
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        auth_field: scopes,
    }
    encoded_jwt = jwt.encode(
        jwt_data, key=rsa_key.private_key_pem, algorithm=rsa_key.jose_algorithm
    )

    requests_mock.get(config_url, json=configuration)
    requests_mock.get(jwks_url, json=keys)

    auth_header = f"{api_token_auth_settings.AUTH_SCHEME} {encoded_jwt}"

    return auth_header


def test_get_profile_data_from_gdpr_api(gdpr_api_client, user, requests_mock):
    auth_header = get_api_token_for_user_with_scopes(
        user, [settings.GDPR_API_QUERY_SCOPE], requests_mock
    )
    valid_response = {
        "key": "USER",
        "children": [
            {"key": "FIRST_NAME", "value": user.first_name},
            {"key": "LAST_NAME", "value": user.last_name},
            {"key": "EMAIL", "value": user.email},
            {"key": "DATE_JOINED", "value": format_date(user.date_joined)},
            {"key": "LAST_LOGIN", "value": format_date(user.last_login)},
        ],
    }
    gdpr_api_client.credentials(HTTP_AUTHORIZATION=auth_header)
    response = gdpr_api_client.get(reverse("gdpr_v1", kwargs={"uuid": user.username}))
    assert response.status_code == 200
    assert response.json() == valid_response


def test_delete_profile_data_from_gdpr_api(gdpr_api_client, user, requests_mock):
    auth_header = get_api_token_for_user_with_scopes(
        user, [settings.GDPR_API_DELETE_SCOPE], requests_mock
    )
    gdpr_api_client.credentials(HTTP_AUTHORIZATION=auth_header)
    response = gdpr_api_client.delete(
        reverse("gdpr_v1", kwargs={"uuid": user.username})
    )
    assert response.status_code == 204
    with pytest.raises(User.DoesNotExist):
        User.objects.get(username=user.username)


def test_gdpr_api_requires_authentication(gdpr_api_client, user):
    response = gdpr_api_client.get(reverse("gdpr_v1", kwargs={"uuid": user.username}))
    assert response.status_code == 401

    response = gdpr_api_client.delete(
        reverse("gdpr_v1", kwargs={"uuid": user.username})
    )
    assert response.status_code == 401


def test_user_can_only_access_his_own_profile(gdpr_api_client, user, requests_mock):
    auth_header = get_api_token_for_user_with_scopes(
        user,
        [settings.GDPR_API_QUERY_SCOPE, settings.GDPR_API_DELETE_SCOPE],
        requests_mock,
    )
    gdpr_api_client.credentials(HTTP_AUTHORIZATION=auth_header)

    another_user = HelsinkiProfileUserFactory()
    response = gdpr_api_client.get(
        reverse("gdpr_v1", kwargs={"uuid": another_user.username})
    )
    assert response.status_code == 403

    response = gdpr_api_client.delete(
        reverse("gdpr_v1", kwargs={"uuid": another_user.username})
    )
    assert response.status_code == 403
