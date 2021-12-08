import pytest
from rest_framework import status
from rest_framework.reverse import reverse

from applications.api.v1.serializers import YouthApplicationSerializer


@pytest.mark.django_db
def test_youth_applications_list(api_client):
    response = api_client.get(reverse("v1:youthapplication-list"))

    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
@pytest.mark.parametrize(
    "test_value",
    [
        "010203-1230",
        "121212A899H",
        "111111-111C",
        "111111A111C",
        # Django Rest Framework's serializers.CharField trims leading and trailing
        # whitespace by default, so we allow them here.
        "     111111-111C",
        "111111-111C     ",
        "   111111-111C  ",
    ],
)
def test_youth_application_post_valid_social_security_number(
    api_client, youth_application, test_value
):
    data = YouthApplicationSerializer(youth_application).data
    data["social_security_number"] = test_value
    response = api_client.post(reverse("v1:youthapplication-list"), data)

    assert response.status_code == status.HTTP_201_CREATED
    assert "social_security_number" in response.data


@pytest.mark.django_db
def test_youth_application_post_invalid_language(api_client, youth_application):
    data = YouthApplicationSerializer(youth_application).data
    data["language"] = "asd"
    response = api_client.post(reverse("v1:youthapplication-list"), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "language" in response.data


@pytest.mark.django_db
@pytest.mark.parametrize(
    "test_value",
    [
        # A temporary social security number (900-999)
        "111111-900U",
        "111111-9991",
        # Inner whitespace
        "111111 -111C",
        "111111-111 C",
        " 111111 - 111C ",
        # Not uppercase
        "111111-111c",
        "111111a111C",
        # Invalid checksum
        "111111-111X",  # "111111-111C" would be valid
        "111111A111W",  # "111111A111C" would be valid
        "010203-123A",  # "010203-1230" would be valid
        "121212A899F",  # "121212A899H" would be valid
        # Combination
        "111111 -111x",  # Invalid checksum, inner whitespace, not uppercase
    ],
)
def test_youth_application_post_invalid_social_security_number(
    api_client, youth_application, test_value
):
    data = YouthApplicationSerializer(youth_application).data
    data["social_security_number"] = test_value
    response = api_client.post(reverse("v1:youthapplication-list"), data)

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "social_security_number" in response.data
