from datetime import timedelta

import pytest

from applications.services.ahjo_xml_builder import (
    AhjoPublicXMLBuilder,
    AhjoSecretXMLBuilder,
    BenefitPeriodRow,
)
from calculator.enums import RowType
from calculator.models import CalculationRow
from calculator.tests.factories import CalculationRowFactory


@pytest.fixture
def calculation(decided_application):
    calculation = decided_application.calculation
    calculation.rows.all().delete()
    return calculation


@pytest.fixture
def secret_xml_builder(decided_application):
    return AhjoSecretXMLBuilder(decided_application)


@pytest.fixture
def public_xml_builder(decided_application, accepted_ahjo_decision_text):
    return AhjoPublicXMLBuilder(decided_application, accepted_ahjo_decision_text)


@pytest.fixture
def monthly_row_1(calculation, ordering: int = 3):
    return CalculationRowFactory(
        calculation=calculation,
        row_type=RowType.HELSINKI_BENEFIT_MONTHLY_EUR,
        ordering=ordering,
        start_date=None,
        end_date=None,
    )


@pytest.fixture
def sub_total_row_1(calculation, ordering: int = 4):
    return CalculationRowFactory(
        calculation=calculation,
        row_type=RowType.HELSINKI_BENEFIT_SUB_TOTAL_EUR,
        ordering=ordering,
        start_date=calculation.start_date,
        end_date=calculation.start_date + timedelta(days=30),
    )


@pytest.fixture
def monthly_row_2(calculation, ordering: int = 5):
    return CalculationRowFactory(
        calculation=calculation,
        row_type=RowType.HELSINKI_BENEFIT_MONTHLY_EUR,
        ordering=ordering,
        start_date=None,
        end_date=None,
    )


@pytest.fixture
def sub_total_row_2(calculation, ordering: int = 6):
    return CalculationRowFactory(
        calculation=calculation,
        row_type=RowType.HELSINKI_BENEFIT_SUB_TOTAL_EUR,
        ordering=ordering,
        start_date=calculation.start_date + timedelta(days=31),
        end_date=calculation.end_date,
    )


@pytest.fixture
def total_eur_row(calculation, ordering: int = 8):
    return CalculationRowFactory(
        calculation=calculation,
        row_type=RowType.HELSINKI_BENEFIT_TOTAL_EUR,
        ordering=ordering,
        start_date=calculation.start_date,
        end_date=calculation.end_date,
    )


@pytest.mark.django_db
def test_generate_secret_xml_string(decided_application, secret_xml_builder):
    application = decided_application
    xml_content = secret_xml_builder.generate_xml()

    wanted_language = application.applicant_language

    # Check if the returned XML string contains the expected content
    assert f'<main id="paatoksenliite" lang="{wanted_language}">' in xml_content


@pytest.mark.django_db
def test_generate_public_xml_string(accepted_ahjo_decision_text, public_xml_builder):
    xml_content = public_xml_builder.generate_xml()
    wanted_decision_text = accepted_ahjo_decision_text.decision_text

    # Check if the returned XML string contains the expected content
    assert wanted_decision_text in xml_content


def test_public_xml_file_name(decided_application, public_xml_builder):
    application = decided_application
    xml_file_name = public_xml_builder.generate_xml_file_name()

    wanted_file_name = f"decision_text_{application.application_number}.xml"

    assert xml_file_name == wanted_file_name


def test_secret_xml_decision_string(decided_application, secret_xml_builder):
    calculation = decided_application.calculation
    row = CalculationRowFactory(
        calculation=calculation,
        row_type=RowType.HELSINKI_BENEFIT_SUB_TOTAL_EUR,
        ordering=4,
        start_date=calculation.start_date,
        end_date=calculation.end_date,
    )

    xml_string = secret_xml_builder.generate_xml()

    wanted_replacements = [
        str(decided_application.application_number),
        decided_application.company.name,
        decided_application.company.business_id,
        decided_application.employee.last_name,
        decided_application.employee.first_name,
        f"{row.start_date.strftime('%d.%m.%Y')} - {row.end_date.strftime('%d.%m.%Y')}",
        str(row.amount),
        str(calculation.calculated_benefit_amount),
    ]
    assert all([replacement in xml_string for replacement in wanted_replacements])


def test_secret_xml_file_name(decided_application, secret_xml_builder):
    application = decided_application
    xml_file_name = secret_xml_builder.generate_xml_file_name()

    wanted_file_name = f"decision_text_secret_{application.application_number}.xml"

    assert xml_file_name == wanted_file_name


@pytest.mark.django_db
def test_get_period_rows_for_xml(
    decided_application,
    secret_xml_builder,
    monthly_row_1,
    sub_total_row_1,
    total_eur_row,
):
    total_amount_row, calculation_rows = secret_xml_builder._get_period_rows_for_xml(
        decided_application.calculation
    )

    assert total_eur_row == total_amount_row
    assert len(calculation_rows) == 2
    assert sub_total_row_1 in calculation_rows
    assert monthly_row_1 in calculation_rows


def test_prepare_multiple_period_rows(
    secret_xml_builder, monthly_row_1, sub_total_row_1, monthly_row_2, sub_total_row_2
):
    calculation_rows = [monthly_row_1, sub_total_row_1, monthly_row_2, sub_total_row_2]

    period_rows = secret_xml_builder._prepare_multiple_period_rows(calculation_rows)

    assert len(period_rows) == 2
    assert period_rows[0].start_date == sub_total_row_1.start_date
    assert period_rows[0].end_date == sub_total_row_1.end_date
    assert period_rows[0].amount_per_month == monthly_row_1.amount
    assert period_rows[0].total_amount == sub_total_row_1.amount

    assert period_rows[1].start_date == sub_total_row_2.start_date
    assert period_rows[1].end_date == sub_total_row_2.end_date
    assert period_rows[1].amount_per_month == monthly_row_2.amount
    assert period_rows[1].total_amount == sub_total_row_2.amount


def test_prepare_single_period_row(secret_xml_builder, monthly_row_1, total_eur_row):
    period_rows = secret_xml_builder._prepare_single_period_row(
        monthly_row_1, total_eur_row
    )

    assert len(period_rows) == 1
    assert period_rows[0].start_date == total_eur_row.start_date
    assert period_rows[0].end_date == total_eur_row.end_date
    assert period_rows[0].amount_per_month == monthly_row_1.amount
    assert period_rows[0].total_amount == total_eur_row.amount


def test_get_context_for_secret_xml_with_single_period(
    decided_application, monthly_row_1, total_eur_row, secret_xml_builder
):
    context = secret_xml_builder.get_context_for_secret_xml()

    assert context["application"] == decided_application
    assert len(context["calculation_periods"]) == 1
    assert isinstance(context["calculation_periods"][0], BenefitPeriodRow)
    assert context["calculation_periods"][0].start_date == total_eur_row.start_date
    assert context["calculation_periods"][0].end_date == total_eur_row.end_date
    assert context["calculation_periods"][0].amount_per_month == monthly_row_1.amount
    assert context["calculation_periods"][0].total_amount == total_eur_row.amount
    assert context["language"] == decided_application.applicant_language
    assert isinstance(context["total_amount_row"], CalculationRow)
    assert context["total_amount_row"] == total_eur_row


def test_get_context_for_secret_xml_with_multiple_periods(
    calculation, decided_application, monthly_row_1, sub_total_row_1, secret_xml_builder
):
    monthly_row_2 = CalculationRowFactory(
        calculation=calculation,
        row_type=RowType.HELSINKI_BENEFIT_MONTHLY_EUR,
        ordering=6,
        start_date=None,
        end_date=None,
    )

    sub_total_row_2 = CalculationRowFactory(
        calculation=calculation,
        row_type=RowType.HELSINKI_BENEFIT_SUB_TOTAL_EUR,
        ordering=7,
        start_date=calculation.start_date + timedelta(days=31),
        end_date=calculation.end_date,
    )

    context = secret_xml_builder.get_context_for_secret_xml()

    assert context["application"] == decided_application
    assert len(context["calculation_periods"]) == 2
    assert isinstance(context["calculation_periods"][0], BenefitPeriodRow)
    assert context["calculation_periods"][0].start_date == sub_total_row_1.start_date
    assert context["calculation_periods"][0].end_date == sub_total_row_1.end_date
    assert context["calculation_periods"][0].amount_per_month == monthly_row_1.amount
    assert context["calculation_periods"][0].total_amount == sub_total_row_1.amount
    assert isinstance(context["calculation_periods"][1], BenefitPeriodRow)
    assert context["calculation_periods"][1].start_date == sub_total_row_2.start_date
    assert context["calculation_periods"][1].end_date == sub_total_row_2.end_date
    assert context["calculation_periods"][1].amount_per_month == monthly_row_2.amount
    assert context["calculation_periods"][1].total_amount == sub_total_row_2.amount
