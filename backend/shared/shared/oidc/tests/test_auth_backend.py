import datetime
import re
from typing import Optional
from unittest import mock

import pytest
from dateutil.parser import isoparse
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sessions.middleware import SessionMiddleware
from django.test import override_settings
from django.utils import timezone

from shared.common.tests.conftest import store_tokens_in_session
from shared.common.tests.utils import set_setting_to_value_or_del_with_none
from shared.oidc.auth import HelsinkiOIDCAuthenticationBackend
from shared.oidc.utils import store_token_info_in_oidc_session


@pytest.fixture
def _test_claims() -> dict:
    return {
        "sub": "testuser",
        "given_name": "test_given_name",
        "family_name": "test_family_name",
        "email": "test_email",
    }


def check_token_info(request, token_info):
    access_token_expires = timezone.now() + datetime.timedelta(
        seconds=token_info["expires_in"]
    )
    refresh_token_expires = timezone.now() + datetime.timedelta(
        seconds=token_info["refresh_expires_in"]
    )

    assert request.session.get("oidc_id_token") == token_info["id_token"]
    assert request.session.get("oidc_access_token") == token_info["access_token"]
    assert abs(
        isoparse(request.session.get("oidc_access_token_expires"))
        - access_token_expires
    ) < datetime.timedelta(seconds=10)
    assert request.session.get("oidc_refresh_token") == token_info["refresh_token"]
    assert abs(
        isoparse(request.session.get("oidc_refresh_token_expires"))
        - refresh_token_expires
    ) < datetime.timedelta(seconds=10)


def check_user_with_personal_info(user, claims):
    assert user.username == claims["sub"]
    assert user.first_name == claims["given_name"]
    assert user.last_name == claims["family_name"]
    assert user.email == claims["email"]


def check_user_without_personal_info(user, claims):
    assert user.username == claims["sub"]
    assert user.first_name == ""
    assert user.last_name == ""
    assert user.email == ""


@pytest.mark.django_db
@override_settings(
    AUTHENTICATION_BACKENDS=("django.contrib.auth.backends.ModelBackend",),
    OIDC_OP_USER_ENDPOINT="http://example.com/userinfo/",
    NEXT_PUBLIC_MOCK_FLAG=False,
)
@pytest.mark.parametrize(
    "oidc_save_personally_identifiable_info,expect_personal_info_removal",
    [(None, True), (False, True), (True, False)],  # None means no setting at all
)
def test_authenticate(
    settings,
    _test_claims,
    requests_mock,
    oidc_save_personally_identifiable_info: Optional[bool],
    expect_personal_info_removal: bool,
    mock_request,
    get_response,
):
    set_setting_to_value_or_del_with_none(
        "OIDC_SAVE_PERSONALLY_IDENTIFIABLE_INFO",
        oidc_save_personally_identifiable_info,
    )
    auth_backend = HelsinkiOIDCAuthenticationBackend()

    matcher = re.compile(re.escape(settings.OIDC_OP_USER_ENDPOINT))
    requests_mock.get(matcher, json=_test_claims)

    request = mock_request
    middleware = SessionMiddleware(get_response)
    middleware.process_request(request)
    request.session.save()

    token_info = {
        "id_token": "test1",
        "access_token": "test2",
        "expires_in": 300,
        "refresh_token": "test3",
        "refresh_expires_in": 1800,
    }

    with mock.patch(
        "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend.get_token",
        return_value=token_info,
    ):
        with mock.patch(
            "shared.oidc.auth.HelsinkiOIDCAuthenticationBackend.verify_token",
            return_value={"test": "ok"},
        ):
            user = auth_backend.authenticate(request)

    check_token_info(request, token_info)

    if expect_personal_info_removal:
        check_user_without_personal_info(user, _test_claims)
    else:
        check_user_with_personal_info(user, _test_claims)


@pytest.mark.django_db
def test_filter_users_by_claims(user):
    auth_backend = HelsinkiOIDCAuthenticationBackend()

    claims = {"sub": user.username}
    users = auth_backend.filter_users_by_claims(claims)
    assert list(users) == list(get_user_model().objects.filter(id=user.id))


@pytest.mark.django_db
def test_filter_users_by_claims_no_user():
    auth_backend = HelsinkiOIDCAuthenticationBackend()

    claims = {"sub": "testuser"}
    users = auth_backend.filter_users_by_claims(claims)
    assert list(users) == list(get_user_model().objects.none())


@pytest.mark.django_db
@pytest.mark.parametrize(
    "oidc_save_personally_identifiable_info",
    [None, False],  # None means no setting at all
)
def test_create_user_when_personal_info_should_not_be_saved(
    _test_claims, oidc_save_personally_identifiable_info: Optional[bool]
):
    set_setting_to_value_or_del_with_none(
        "OIDC_SAVE_PERSONALLY_IDENTIFIABLE_INFO",
        oidc_save_personally_identifiable_info,
    )
    auth_backend = HelsinkiOIDCAuthenticationBackend()
    user = auth_backend.create_user(_test_claims)
    check_user_without_personal_info(user, _test_claims)


@pytest.mark.django_db
@override_settings(OIDC_SAVE_PERSONALLY_IDENTIFIABLE_INFO=True)
def test_create_user_when_personal_info_should_be_saved(_test_claims):
    auth_backend = HelsinkiOIDCAuthenticationBackend()
    user = auth_backend.create_user(_test_claims)
    check_user_with_personal_info(user, _test_claims)


@pytest.mark.django_db
def test_store_token_info_in_session(session_request):
    token_info = {
        "id_token": "test1",
        "access_token": "test2",
        "expires_in": 300,
        "refresh_token": "test3",
        "refresh_expires_in": 1800,
    }

    store_token_info_in_oidc_session(session_request, token_info)

    check_token_info(session_request, token_info)


@pytest.mark.django_db
@override_settings(
    OIDC_OP_TOKEN_ENDPOINT="http://example.com/token/",
    NEXT_PUBLIC_MOCK_FLAG=False,
)
def test_refresh_token(session_request, requests_mock):
    store_tokens_in_session(session_request)
    auth_backend = HelsinkiOIDCAuthenticationBackend()

    token_info = {
        "id_token": "test1",
        "access_token": "test2",
        "expires_in": 300,
        "refresh_token": "test3",
        "refresh_expires_in": 1800,
    }

    matcher = re.compile(re.escape(settings.OIDC_OP_TOKEN_ENDPOINT))
    requests_mock.post(matcher, json=token_info)

    auth_backend.refresh_tokens(session_request)

    check_token_info(session_request, token_info)
