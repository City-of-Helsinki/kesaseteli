from companies.models import Company

from shared.oidc.utils import get_organization_roles


def get_business_id_from_user(user):
    if user.is_authenticated:
        eauth_profile = user.oidc_profile.eauthorization_profile
        organization_roles = get_organization_roles(eauth_profile)
        return organization_roles.get("identifier")
    return None


def get_company_from_user(user):
    if business_id := get_business_id_from_user(user):
        return Company.objects.filter(
            business_id=business_id
        ).first()  # unique constraint ensures at most one is returned
    else:
        return None
