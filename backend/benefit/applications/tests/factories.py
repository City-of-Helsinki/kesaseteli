import itertools
import os
import random
from datetime import date, timedelta

import factory

from applications.enums import (
    ApplicationStatus,
    ApplicationStep,
    BenefitType,
    PaySubsidyGranted,
)
from applications.models import (
    AhjoDecision,
    Application,
    APPLICATION_LANGUAGE_CHOICES,
    ApplicationBasis,
    ApplicationBatch,
    Attachment,
    ATTACHMENT_CONTENT_TYPE_CHOICES,
    AttachmentType,
    DeMinimisAid,
    Employee,
)
from calculator.models import Calculation
from companies.tests.factories import CompanyFactory
from shared.service_bus.enums import YtjOrganizationCode
from users.tests.factories import BFHandlerUserFactory


class AttachmentFactory(factory.django.DjangoModelFactory):
    attachment_type = factory.Faker(
        "random_element", elements=[v for v in AttachmentType.values]
    )
    content_type = ATTACHMENT_CONTENT_TYPE_CHOICES[0][0]
    attachment_file = factory.django.FileField(
        from_path=f"{os.path.dirname(os.path.realpath(__file__))}/valid_pdf_file.pdf",
        filename="attachment_pdf_file.pdf",
    )

    class Meta:
        model = Attachment


class DeMinimisAidFactory(factory.django.DjangoModelFactory):
    granter = factory.Faker("sentence", nb_words=2, locale="fi_FI")

    # delay evaluation of date_start and date_end so that any freeze_time takes effect
    granted_at = factory.Faker(
        "date_between_dates",
        date_start=factory.LazyAttribute(
            lambda _: date.today() - timedelta(days=365 * 2)
        ),
        date_end=factory.LazyAttribute(lambda _: date.today()),
    )
    amount = factory.Faker("pyint", min_value=1, max_value=100000)
    ordering = factory.Iterator(itertools.count(0))

    class Meta:
        model = DeMinimisAid


class ApplicationBasisFactory(factory.django.DjangoModelFactory):
    identifier = factory.Sequence(
        lambda id: f"basis_identifier_{id}"
    )  # ensure it is unique

    class Meta:
        model = ApplicationBasis


class ApplicationFactory(factory.django.DjangoModelFactory):
    company = factory.SubFactory(CompanyFactory)
    employee = factory.RelatedFactory(
        "applications.tests.factories.EmployeeFactory",
        factory_related_name="application",
    )
    company_name = factory.Faker("sentence", nb_words=2)
    company_form = factory.Faker("sentence", nb_words=1)
    company_form_code = YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT
    company_department = factory.Faker("street_address", locale="fi_FI")
    official_company_street_address = factory.Faker("street_address", locale="fi_FI")
    official_company_city = factory.Faker("city", locale="fi_FI")
    official_company_postcode = factory.Faker("postcode", locale="fi_FI")
    use_alternative_address = factory.Faker("boolean")
    alternative_company_street_address = factory.Faker("street_address", locale="fi_FI")
    alternative_company_city = factory.Faker("city", locale="fi_FI")
    alternative_company_postcode = factory.Faker("postcode", locale="fi_FI")
    company_bank_account_number = factory.Faker("iban", locale="fi_FI")
    company_contact_person_phone_number = factory.Sequence(
        lambda n: f"050-10000{n}"
    )  # max.length in validation seems to be 10 digits
    company_contact_person_email = factory.Faker("email", locale="fi_FI")
    company_contact_person_first_name = factory.Faker("first_name", locale="fi_FI")
    company_contact_person_last_name = factory.Faker("last_name", locale="fi_FI")
    association_has_business_activities = None
    applicant_language = factory.Faker(
        "random_element", elements=[v[0] for v in APPLICATION_LANGUAGE_CHOICES]
    )
    co_operation_negotiations = factory.Faker("boolean")
    co_operation_negotiations_description = factory.Maybe(
        "co_operation_negotiations", factory.Faker("paragraph"), ""
    )
    pay_subsidy_granted = PaySubsidyGranted.NOT_GRANTED
    pay_subsidy_percent = None

    additional_pay_subsidy_percent = None

    apprenticeship_program = None
    archived = False
    application_step = ApplicationStep.STEP_1
    benefit_type = BenefitType.EMPLOYMENT_BENEFIT
    start_date = factory.Faker(
        "date_between_dates",
        date_start=date(date.today().year, 1, 1),
        date_end=date.today() + timedelta(days=100),
    )
    end_date = factory.LazyAttribute(
        lambda o: o.start_date + timedelta(days=random.randint(31, 364))
    )
    de_minimis_aid = True
    status = ApplicationStatus.DRAFT

    @factory.post_generation
    def bases(self, created, extracted, **kwargs):
        if basis_count := kwargs.pop("basis_count", random.randint(1, 5)):
            for bt in ApplicationBasisFactory.create_batch(basis_count, **kwargs):
                self.bases.add(bt)

    de_minimis_1 = factory.RelatedFactory(
        DeMinimisAidFactory,
        factory_related_name="application",
    )
    de_minimis_2 = factory.RelatedFactory(
        DeMinimisAidFactory,
        factory_related_name="application",
    )

    class Meta:
        model = Application


attachment_factory_string = "applications.tests.factories.AttachmentFactory"


class ApplicationWithAttachmentFactory(ApplicationFactory):
    attachment = factory.RelatedFactory(
        attachment_factory_string,
        factory_related_name="application",
        attachment_type="employment_contract",
    )
    attachment_2 = factory.RelatedFactory(
        attachment_factory_string,
        factory_related_name="application",
        attachment_type="pay_subsidy_decision",
    )

    attachment_3 = factory.RelatedFactory(
        attachment_factory_string,
        factory_related_name="application",
        attachment_type="commission_contract",
    )

    attachment_4 = factory.RelatedFactory(
        attachment_factory_string,
        factory_related_name="application",
        attachment_type="education_contract",
    )
    attachment_5 = factory.RelatedFactory(
        attachment_factory_string,
        factory_related_name="application",
        attachment_type="helsinki_benefit_voucher",
    )
    attachment_6 = factory.RelatedFactory(
        attachment_factory_string,
        factory_related_name="application",
        attachment_type="employee_consent",
    )
    attachment_7 = factory.RelatedFactory(
        attachment_factory_string,
        factory_related_name="application",
        attachment_type="full_application",
    )
    attachment_8 = factory.RelatedFactory(
        attachment_factory_string,
        factory_related_name="application",
        attachment_type="other_attachment",
    )


class ReceivedApplicationFactory(ApplicationWithAttachmentFactory):
    status = ApplicationStatus.RECEIVED
    applicant_terms_approval = factory.RelatedFactory(
        "terms.tests.factories.ApplicantTermsApprovalFactory",
        factory_related_name="application",
    )
    calculation = factory.RelatedFactory(
        "calculator.tests.factories.CalculationFactory",
        factory_related_name="application",
    )

    @factory.post_generation
    def received_log_event(self, created, extracted, **kwargs):
        self.log_entries.create(
            from_status=ApplicationStatus.DRAFT,
            to_status=ApplicationStatus.RECEIVED,
        )

    @factory.post_generation
    def calculation(self, created, extracted, **kwargs):
        self.calculation = Calculation.objects.create_for_application(self, **kwargs)
        self.calculation.init_calculator()
        self.calculation.calculate()


class HandlingApplicationFactory(ReceivedApplicationFactory):
    status = ApplicationStatus.HANDLING

    @factory.post_generation
    def handling_log_event(self, created, extracted, **kwargs):
        self.log_entries.create(
            from_status=ApplicationStatus.RECEIVED,
            to_status=ApplicationStatus.HANDLING,
        )

    @factory.post_generation
    def calculation(self, created, extracted, **kwargs):
        from calculator.tests.factories import (  # avoid circular import
            PaySubsidyFactory,
        )

        previous_status = self.status
        self.status = (
            ApplicationStatus.HANDLING
        )  # so that recalculation succeeds even in subclasses
        self.calculation = Calculation.objects.create_for_application(self)
        self.save()
        self.calculation.start_date = self.start_date
        self.calculation.end_date = self.end_date
        self.calculation.state_aid_max_percentage = 50
        self.calculation.handler = BFHandlerUserFactory()
        self.calculation.save()
        PaySubsidyFactory(
            application=self,
            start_date=self.calculation.start_date,
            end_date=self.calculation.end_date,
        )
        self.calculation.calculate()
        self.status = previous_status
        self.save()
        assert len(self.ahjo_rows) == 1


class CancelledApplicationFactory(ApplicationWithAttachmentFactory):
    status = ApplicationStatus.CANCELLED

    @factory.post_generation
    def cancelled_log_event(self, created, extracted, **kwargs):
        self.log_entries.create(
            from_status=ApplicationStatus.DRAFT,
            to_status=ApplicationStatus.CANCELLED,
        )


class DecidedApplicationFactory(HandlingApplicationFactory):
    status = ApplicationStatus.ACCEPTED

    @factory.post_generation
    def handling_log_event(self, created, extracted, **kwargs):
        self.log_entries.create(
            from_status=ApplicationStatus.HANDLING,
            to_status=self.status,
        )


class AdditionalInformationNeededApplicationFactory(HandlingApplicationFactory):
    status = ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED

    @factory.post_generation
    def handling_log_event(self, created, extracted, **kwargs):
        self.log_entries.create(
            from_status=ApplicationStatus.HANDLING,
            to_status=self.status,
        )


class RejectedApplicationFactory(HandlingApplicationFactory):
    status = ApplicationStatus.REJECTED

    @factory.post_generation
    def handling_log_event(self, created, extracted, **kwargs):
        self.log_entries.create(
            from_status=ApplicationStatus.HANDLING,
            to_status=self.status,
        )


class EmployeeFactory(factory.django.DjangoModelFactory):
    # pass employee=None to prevent ApplicationFactory from creating another employee
    application = factory.SubFactory(ApplicationFactory, employee=None)
    first_name = factory.Faker("first_name", locale="fi_FI")
    last_name = factory.Faker("last_name", locale="fi_FI")
    social_security_number = factory.Faker("ssn", locale="fi_FI")
    phone_number = factory.Sequence(lambda n: f"050-10000{n}")
    email = factory.Faker("email", locale="fi_FI")

    employee_language = factory.Faker(
        "random_element", elements=[v[0] for v in APPLICATION_LANGUAGE_CHOICES]
    )
    job_title = factory.Faker("job", locale="fi_FI")
    monthly_pay = factory.Faker("random_int", max=5000)
    vacation_money = factory.Faker("random_int", max=5000)
    other_expenses = factory.Faker("random_int", max=5000)
    working_hours = factory.Faker("random_int", min=18, max=40)
    is_living_in_helsinki = factory.Faker("boolean")

    collective_bargaining_agreement = factory.Faker("word")

    class Meta:
        model = Employee


class BaseApplicationBatchFactory(factory.django.DjangoModelFactory):
    proposal_for_decision = AhjoDecision.DECIDED_ACCEPTED
    application_1 = factory.RelatedFactory(
        DecidedApplicationFactory,
        factory_related_name="batch",
        status=factory.SelfAttribute("batch.proposal_for_decision"),
    )

    application_2 = factory.RelatedFactory(
        DecidedApplicationFactory,
        factory_related_name="batch",
        status=factory.SelfAttribute("batch.proposal_for_decision"),
    )

    class Meta:
        model = ApplicationBatch


class ApplicationBatchFactory(BaseApplicationBatchFactory):
    decision_date = factory.Faker(
        "date_between_dates",
        date_start=factory.LazyAttribute(lambda _: date.today() - timedelta(days=30)),
        date_end=factory.LazyAttribute(lambda _: date.today()),
    )
    decision_maker_title = factory.Faker("job", locale="fi_FI")
    decision_maker_name = factory.Faker("name", locale="fi_FI")
    section_of_the_law = "§1234"
    expert_inspector_name = factory.Faker("name", locale="fi_FI")
    expert_inspector_email = factory.Faker("email", locale="fi_FI")
    expert_inspector_title = factory.Faker("job", locale="fi_FI")

    p2p_inspector_name = factory.Faker("name", locale="fi_FI")
    p2p_inspector_email = factory.Faker("email", locale="fi_FI")
    p2p_checker_name = factory.Faker("name", locale="fi_FI")

    class Meta:
        model = ApplicationBatch
