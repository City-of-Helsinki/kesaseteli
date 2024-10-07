from django.db import models
from django.utils.translation import gettext_lazy as _

from common.localized_iban_field import LocalizedIBANField
from shared.models.abstract_models import AbstractCompany


class Company(AbstractCompany):
    bank_account_number = LocalizedIBANField(
        include_countries=("FI",), verbose_name=_("bank account number"), blank=True
    )
    company_form_code = models.IntegerField(
        verbose_name=_("YTJ type code for company form")
    )

    def __str__(self):
        return self.name

    class Meta:
        db_table = "bf_companies_company"
        verbose_name = _("company")
        verbose_name_plural = _("companies")

    def get_full_address(self):
        return f"{self.street_address}, {self.postcode} {self.city}"
