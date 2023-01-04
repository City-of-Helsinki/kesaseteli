import operator
from datetime import date
from functools import reduce
from urllib.parse import urlparse

from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.db.models import Q, QuerySet
from django.http import HttpResponseRedirect
from django.shortcuts import resolve_url
from stdnum.fi.hetu import (
    compact as compact_finnish_social_security_number,
    validate as validate_finnish_social_security_number,
)

_ALWAYS_FALSE_Q_FILTER = Q(pk=None)  # A hack but works as primary keys can't be null


def set_setting_to_value_or_del_with_none(setting_name: str, setting_value) -> None:
    """
    Set setting <setting_name> to value <setting_value> if <setting_value> is not None,
    otherwise delete the setting <setting_name> if it exists.
    """
    if setting_value is None:
        if hasattr(settings, setting_name):
            delattr(settings, setting_name)
    else:
        setattr(settings, setting_name, setting_value)


def any_of_q_filter(**kwargs):
    """
    Return Q filters combined with | i.e. match any of the given keyword arguments.
    Return an always false Q filter if no keyword arguments are given.

    NOTE: Supports "not__" prefix to invert a particular Q expression i.e. ~Q().

    Example:
        any_of_q_filter(a=1, b__lt=2, not__c__gte=3)
        returns
            Q(a=1) | Q(b__lt=2) | ~Q(c__gte=3)

    :warning: Does not support field with name "not"
    :warning: Does not support multiple "not__" prefixes for a single field
    """
    if not kwargs:
        return _ALWAYS_FALSE_Q_FILTER
    return reduce(
        operator.or_,
        (
            ~Q(**{key[len("not__") :]: value})
            if key.startswith("not__")
            else Q(**{key: value})
            for key, value in kwargs.items()
        ),
    )


class MatchesAnyOfQuerySet(QuerySet):
    """
    QuerySet which supports OR filtering using matches_any_of member function.
    See matches_any_of function for details.

    NOTE: Put left in class declaration to have consistent method resolution order i.e.
          Test(MatchesAnyOfQuerySet, QuerySet) works
          but Test(QuerySet, MatchesAnyOfQuerySet) does not

    Example if TestClass used TestClassQuerySet(MatchesAnyOfQuerySet) as object manager:
        TestClass.objects.matches_any_of(a=1, b__lt=2, not__c__gte=3) would match like
            TestClass.objects.filter(Q(a=1) | Q(b__lt=2) | ~Q(c__gte=3))
    """

    def matches_any_of(self, **kwargs):
        """
        Do any of the given expressions match? If none match or there are no expressions
        then return an empty queryset. If there is some match then return the queryset
        with the objects that matched.

        NOTE: Supports "not__" prefix to invert a particular expression.

        Example:
            self.matches_any_of(a=1, b__lt=2, not__c__gte=3)
            returns
                self.filter(Q(a=1) | Q(b__lt=2) | ~Q(c__gte=3))

        :warning: Does not support field with name "not"
        :warning: Does not support multiple "not__" prefixes for a single field
        """
        return self.filter(any_of_q_filter(**kwargs))


def redirect_to_login_using_request(
    request, login_url=None, redirect_field_name=REDIRECT_FIELD_NAME
) -> HttpResponseRedirect:
    """
    Redirect to login page similarly as in django.contrib.auth.decorators.user_passes_test.

    See user_passes_test for reference:
    https://github.com/django/django/blob/3.2.4/django/contrib/auth/decorators.py#L22-L33
    """
    path = request.build_absolute_uri()
    resolved_login_url = resolve_url(login_url or settings.LOGIN_URL)
    # If the login url is the same scheme and net location then just
    # use the path as the "next" url.
    login_scheme, login_netloc = urlparse(resolved_login_url)[:2]
    current_scheme, current_netloc = urlparse(path)[:2]
    if (not login_scheme or login_scheme == current_scheme) and (
        not login_netloc or login_netloc == current_netloc
    ):
        path = request.get_full_path()
    from django.contrib.auth.views import redirect_to_login

    return redirect_to_login(path, resolved_login_url, redirect_field_name)


def social_security_number_birthdate(social_security_number) -> date:
    """
    Calculate birthdate based on the given Finnish social security number.

    :raises stdnum.exceptions.ValidationError: If social_security_number is not a valid
                                               Finnish social security number.
    :return: Birthdate calculated from the social_security_number.
    """
    compacted_social_security_number = compact_finnish_social_security_number(
        social_security_number
    )
    validate_finnish_social_security_number(
        compacted_social_security_number, allow_temporary=True
    )

    # Unpack social security number into parts (D=Day, M=Month, Y=Year, C=Century):
    # DDMMYYC
    # 0123456
    day = int(compacted_social_security_number[0:2])
    month = int(compacted_social_security_number[2:4])
    year_mod_100 = int(compacted_social_security_number[4:6])
    century_char = compacted_social_security_number[6]
    century = {"+": 1800, "-": 1900, "A": 2000}[century_char]
    return date(year=century + year_mod_100, month=month, day=day)


def create_finnish_social_security_number(
    birthdate: date, individual_number: int
) -> str:
    """
    Create a Finnish social security number based on birthdate and individual number

    :param birthdate: Date of birth
    :param individual_number: Integer value where 2 <= individual_number <= 999
    :return: Finnish social security number in format <ddmmyyciiis> where
             dd = day of birth with leading zeroes,
             mm = month of birth with leading zeroes,
             yy = year of birth modulo 100 with leading zeroes,
             c = century of birth ("+" = 1800, "-" = 1900, "A" = 2000),
             iii = individual number in range 2–999 with leading zeroes,
             s = checksum value calculated from <ddmmyyiii>.
    :raises ValueError: if not (1800 <= birthdate.year <= 2099)
    :raises ValueError: if not (2 <= individual_number <= 999)
    """
    if not (1800 <= birthdate.year <= 2099):
        raise ValueError("Invalid birthdate year, only years 1800–2099 are supported")
    if not (2 <= individual_number <= 999):
        raise ValueError("Invalid individual number, must be in range 2–999")
    ddmmyy: str = f"{birthdate.day:02}{birthdate.month:02}{birthdate.year % 100:02}"
    iii: str = f"{individual_number:003}"
    ddmmyyiii: str = f"{ddmmyy}{iii}"
    century_char: str = {18: "+", 19: "-", 20: "A"}[birthdate.year // 100]
    checksum_char: str = "0123456789ABCDEFHJKLMNPRSTUVWXY"[int(ddmmyyiii) % 31]
    return f"{ddmmyy}{century_char}{iii}{checksum_char}"
