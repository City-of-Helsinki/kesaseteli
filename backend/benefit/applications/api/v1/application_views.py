import logging
import re
from datetime import date
from typing import List

from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.core import exceptions
from django.db import transaction
from django.db.models import Q, QuerySet
from django.http import FileResponse, HttpResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from django_filters import DateFromToRangeFilter, rest_framework as filters
from django_filters.widgets import CSVWidget
from drf_spectacular.utils import extend_schema
from rest_framework import filters as drf_filters, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser
from rest_framework.renderers import TemplateHTMLRenderer
from rest_framework.response import Response
from rest_framework.views import APIView
from simple_history.utils import update_change_reason
from sql_util.aggregates import SubqueryCount

from applications.api.v1.serializers.application import (
    ApplicantApplicationSerializer,
    HandlerApplicationSerializer,
)
from applications.api.v1.serializers.application_alteration import (
    ApplicationAlterationSerializer,
)
from applications.api.v1.serializers.attachment import AttachmentSerializer
from applications.enums import (
    ApplicationAlterationState,
    ApplicationBatchStatus,
    ApplicationOrigin,
    ApplicationStatus,
)
from applications.models import Application, ApplicationAlteration, ApplicationBatch
from applications.services.ahjo_integration import (
    ExportFileInfo,
    generate_zip,
    prepare_csv_file,
    prepare_pdf_files,
)
from applications.services.applications_csv_report import ApplicationsCsvService
from applications.services.generate_application_summary import (
    generate_application_summary_file,
    get_context_for_summary_context,
)
from common.permissions import BFIsApplicant, BFIsHandler, TermsOfServiceAccepted
from messages.models import MessageType
from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation
from shared.audit_log.viewsets import AuditLoggingModelViewSet
from users.utils import get_company_from_request

log = logging.getLogger(__name__)


class BaseApplicationFilter(filters.FilterSet):
    status = filters.MultipleChoiceFilter(
        field_name="status",
        widget=CSVWidget,
        choices=ApplicationStatus.choices,
        help_text=(
            "Filter by application status. Multiple statuses may be specified as a"
            " comma-separated list, such as 'status=draft,received'",
        ),
    )
    archived_for_applicant = filters.BooleanFilter(
        method="_get_archived_for_applicant",
        label=_("Displayed in the archive in the applicant view"),
    )

    def _get_archived_for_applicant(self, queryset, name, value: bool):
        """
        Determine if the application is old enough and already handled so that it will
        be shown in the archive section for the applicant.

        Make sure any changes here are reflected in the serializer as well.
        """

        application_statuses = [
            ApplicationStatus.REJECTED,
            ApplicationStatus.ACCEPTED,
        ]
        batch_statuses = [
            ApplicationBatchStatus.DECIDED_ACCEPTED,
            ApplicationBatchStatus.DECIDED_REJECTED,
            ApplicationBatchStatus.SENT_TO_TALPA,
            ApplicationBatchStatus.COMPLETED,
        ]
        archive_threshold = date.today() + relativedelta(days=-14)

        query = {
            "status__in": application_statuses,
            "batch__isnull": False,
            "batch__status__in": batch_statuses,
            "batch__decision_date__lte": archive_threshold.isoformat(),
        }

        if value:
            return queryset.filter(**query)
        else:
            return queryset.filter(~Q(**query))


class ApplicantApplicationFilter(BaseApplicationFilter):
    class Meta:
        model = Application
        fields = {
            "employee__social_security_number": ["exact"],
            "company__business_id": ["exact"],
            "benefit_type": ["exact"],
            "company_name": ["iexact", "icontains"],
            "employee__first_name": ["iexact", "icontains"],
            "employee__last_name": ["iexact", "icontains"],
        }


class HandlerApplicationFilter(BaseApplicationFilter):
    # the date when application was last set to either REJECTED, ACCEPTED or CANCELLED status
    handled_at = DateFromToRangeFilter(method="filter_handled_at")

    def filter_handled_at(self, queryset, name, value):
        assert value.step is None, "Should not happen"
        if value.start and value.stop:
            filter_kw = {"handled_at__range": (value.start, value.stop)}
        elif value.start:
            filter_kw = {"handled_at__gte": value.start}
        elif value.stop:
            filter_kw = {"handled_at__lte": value.stop}
        else:
            # no filtering, so skip the annotation query
            return queryset
        return queryset.filter(
            status__in=HandlerApplicationViewSet.HANDLED_STATUSES, **filter_kw
        )

    class Meta:
        model = Application
        fields = {
            "batch": ["exact", "isnull"],
            "archived": ["exact"],
            "application_number": ["exact"],
            "employee__social_security_number": ["exact"],
            "company__business_id": ["exact"],
            "benefit_type": ["exact"],
            "company_name": ["iexact", "icontains"],
            "employee__first_name": ["iexact", "icontains"],
            "employee__last_name": ["iexact", "icontains"],
            "start_date": ["lt", "lte", "gt", "gte", "exact"],
            "end_date": ["lt", "lte", "gt", "gte", "exact"],
        }


class BaseApplicationViewSet(AuditLoggingModelViewSet):
    filter_backends = [
        drf_filters.OrderingFilter,
        filters.DjangoFilterBackend,
        drf_filters.SearchFilter,
    ]
    search_fields = ["company_name", "company_contact_person_email"]

    def get_queryset(self) -> QuerySet[Application]:
        user = self.request.user
        if settings.NEXT_PUBLIC_MOCK_FLAG or user.is_authenticated:
            return Application.objects.all().select_related("company", "employee")
        return Application.objects.none()

    EXCLUDE_FIELDS_FROM_SIMPLE_LIST = [
        "applicant_terms_approval",
        "bases",
        "attachment_requirements",
        "applicant_terms_approval_needed",
        "applicant_terms_in_effect",
        "former_benefit_info",
        "available_benefit_types",
        "status_last_changed_at",
        "ahjo_decision",
        "latest_decision_comment",
        "training_compensations",
        "pay_subsidies",
        "warnings",
        "attachments",
        "de_minimis_aid_set",
    ]

    def perform_update(self, serializer):
        super().perform_update(serializer)
        # In case new AuditLogEntry objects were created during the
        # processing of the update, then the annotation value for handled_at
        # in the serializer.instance might have become stale.
        # Update the object.
        serializer.instance = self.get_queryset().get(pk=serializer.instance.pk)

        # Update change reason if provided
        if self.request.data.get("change_reason") and self.request.user.is_staff:
            update_change_reason(
                serializer.instance, str(self.request.data.get("change_reason"))
            )

    @action(methods=["get"], detail=False, url_path="simplified_list")
    def simplified_application_list(self, request):
        """
        Convenience action for the frontends that by default excludes the fields that are not normally
        needed in application listing pages.
        """
        context = self.get_serializer_context()
        qs = self._get_simplified_queryset(request, context)
        serializer = self.serializer_class(qs, many=True, context=context)
        data = serializer.data

        # Sorting by encrypted fields has to be done after the data has been retrieved and decrypted
        if request.query_params.get("order_by") in ["employee_name"]:
            data = sorted(
                data,
                key=lambda item: (
                    item["employee"]["last_name"].lower(),
                    item["employee"]["first_name"].lower(),
                ),
            )

        return Response(data, status=status.HTTP_200_OK)

    @action(
        methods=("POST",),
        detail=True,
        url_path="attachments",
        parser_classes=(MultiPartParser,),
    )
    def post_attachment(self, request, *args, **kwargs):
        """
        Upload a single file as attachment.
        Validate that adding attachments is allowed in this application status
        """
        obj = self.get_object()
        if not ApplicationStatus.is_editable_status(self.request.user, obj.status):
            return Response(
                {"detail": _("Operation not allowed for this application status.")},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate request data
        serializer = AttachmentSerializer(
            data={
                "application": obj.id,
                "attachment_file": request.data["attachment_file"],
                "content_type": request.data["attachment_file"].content_type,
                "attachment_type": request.data["attachment_type"],
            }
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _get_simplified_queryset(self, request, context) -> QuerySet:
        qs = self.filter_queryset(self.get_queryset())
        fields = set(context.get("fields", []))
        exclude_fields = set(context.get("exclude_fields", []))
        extra_exclude_fields = set(self.EXCLUDE_FIELDS_FROM_SIMPLE_LIST)
        context["exclude_fields"] = list(
            exclude_fields | (extra_exclude_fields - fields)
        )

        order_by = request.query_params.get("order_by")
        if (
            order_by
            and re.sub(r"^-", "", order_by)
            in ApplicantApplicationSerializer.Meta.fields
        ):
            qs = qs.order_by(order_by)

        exclude_batched = request.query_params.get("exclude_batched") == "1"
        if exclude_batched:
            qs = qs.filter(batch__isnull=True)

        user = self.request.user
        if hasattr(user, "is_handler") and user.is_handler():
            should_filter_archived = request.query_params.get("filter_archived") == "1"
            qs = qs.filter(archived=should_filter_archived)

        return qs

    def _get_attachment(self, attachment_pk):
        try:
            return self.get_object().attachments.get(id=attachment_pk)
        except exceptions.ObjectDoesNotExist:
            return None

    def _attachment_not_found(self):
        return Response(
            {"detail": _("File not found.")}, status=status.HTTP_404_NOT_FOUND
        )

    @action(
        methods=("DELETE",),
        detail=True,
        url_path="attachments/(?P<attachment_pk>[^/.]+)",
        parser_classes=(MultiPartParser,),
    )
    def delete_attachment(self, request, attachment_pk, *args, **kwargs):
        obj = self.get_object()
        if not ApplicationStatus.is_editable_status(self.request.user, obj.status):
            return Response(
                {"detail": _("Operation not allowed for this application status.")},
                status=status.HTTP_403_FORBIDDEN,
            )
        if instance := self._get_attachment(attachment_pk):
            audit_logging.log(
                request.user,
                "",
                Operation.DELETE,
                instance,
            )
            instance.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return self._attachment_not_found()

    @action(
        methods=("GET",),
        detail=True,
        url_path="attachments/(?P<attachment_pk>[^/.]+)/download",
    )
    def download_attachment(self, request, attachment_pk, *args, **kwargs):
        """
        Download a single attachment
        """
        if (
            attachment := self._get_attachment(attachment_pk)
        ) and attachment.attachment_file:
            audit_logging.log(
                request.user,
                "",
                Operation.READ,
                attachment,
            )
            return FileResponse(attachment.attachment_file)
        else:
            return self._attachment_not_found()

    @extend_schema(
        description=(
            "Get a partial application object (not saved in database), with various"
            " fields pre-filled"
        )
    )
    @action(detail=False, methods=["get"])
    def get_application_template(self, request, pk=None):
        """
        TODO: HL-33 (de minimis aid).
        Initial idea:
        if latest_application := get_latest_application():
            de_minimis_aid_set = DeMinimisAidSerializer(latest_de_minimis, many=True).data
            for v in de_minimis_aid_set:
                del v["id"]
        else:
            de_minimis_aid_set = []
        """
        de_minimis_aid_set = []
        return Response(
            {
                "de_minimis_aid": len(de_minimis_aid_set) > 0,
                "de_minimis_aid_set": de_minimis_aid_set,
            }
        )


class ApplicationAlterationViewSet(AuditLoggingModelViewSet):
    serializer_class = ApplicationAlterationSerializer
    queryset = ApplicationAlteration.objects.all()
    http_method_names = ["post", "patch", "head", "delete"]

    APPLICANT_UNEDITABLE_FIELDS = [
        "state",
        "recovery_start_date",
        "recovery_end_date",
        "handled_at",
        "recovery_amount",
    ]

    class Meta:
        model = ApplicationAlteration
        fields = "__all__"
        read_only_fields = [
            "handled_at",
            "recovery_amount",
        ]

    def _prune_fields(self, request):
        if not request.user.is_handler():
            for field in self.APPLICANT_UNEDITABLE_FIELDS:
                if field in request.data.keys():
                    request.data.pop(field)

        return request

    def create(self, request, *args, **kwargs):
        return super().create(self._prune_fields(request), *args, **kwargs)

    def update(self, request, *args, **kwargs):
        return super().update(self._prune_fields(request), *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Only the applicant can delete an alteration, and only if it hasn't yet been
        # opened by a handler.

        alteration = self.get_object()

        if not settings.NEXT_PUBLIC_MOCK_FLAG:
            company = get_company_from_request(request)
            if company != alteration.application.company:
                raise PermissionDenied(_("You are not allowed to do this action"))

        if request.user.is_handler():
            raise PermissionDenied(_("You are not allowed to do this action"))

        if alteration.state != ApplicationAlterationState.RECEIVED:
            raise PermissionDenied(
                _("You cannot delete the change to employment in this state")
            )

        return super().destroy(request, *args, **kwargs)


@extend_schema(
    description=(
        "API for create/read/update/delete operations on Helsinki benefit applications"
        " for applicants"
    )
)
class ApplicantApplicationViewSet(BaseApplicationViewSet):
    serializer_class = ApplicantApplicationSerializer
    permission_classes = [BFIsApplicant, TermsOfServiceAccepted]
    filterset_class = ApplicantApplicationFilter

    def _annotate_unread_messages_count(self, qs):
        # since there other annotations added elsewhere, use subquery to avoid wrong results.
        # also, using a subquery is more performant
        return qs.annotate(
            unread_messages_count=SubqueryCount(
                "messages",
                filter=Q(seen_by_applicant=False) & ~Q(message_type=MessageType.NOTE),
            )
        )

    def get_queryset(self):
        qs = super().get_queryset()
        if settings.NEXT_PUBLIC_MOCK_FLAG:
            return qs
        company = get_company_from_request(self.request)
        if company:
            return self._annotate_unread_messages_count(company.applications).all()
        else:
            return Application.objects.none()


@extend_schema(
    description=(
        "API for create/read/update/delete operations on Helsinki benefit applications"
        " for application handlers"
    )
)
class HandlerApplicationViewSet(BaseApplicationViewSet):
    serializer_class = HandlerApplicationSerializer
    permission_classes = [BFIsHandler]
    filterset_class = HandlerApplicationFilter

    def _annotate_unread_messages_count(self, qs):
        return qs.annotate(
            unread_messages_count=SubqueryCount(
                "messages",
                filter=Q(seen_by_handler=False) & ~Q(message_type=MessageType.NOTE),
            )
        )

    HANDLED_STATUSES = [
        ApplicationStatus.REJECTED,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.CANCELLED,
    ]

    def get_queryset(self):
        # The default ordering in the handling views:
        # * In the "received" table, ordering should be by the send time, most recent first
        # * In the "handling" table, ordering should be by the calculation modification
        #   time, most recent first
        # * In the archive page, ordering should be by handled_at, most recent first.
        # All these goals are achieved by ordering by first handled_at, then
        # calculation.modified_at.
        # * in the "received" and "handling" table, no application has handled_at set yet,
        #   so applications will compare as equals
        # * For received applications, the send time is the same as calculation
        #   modification time
        return self._annotate_unread_messages_count(
            super()
            .get_queryset()
            .select_related("batch", "calculation")
            .prefetch_related(
                "pay_subsidies", "training_compensations", "calculation__rows"
            )
        ).order_by("-handled_at", "-calculation__modified_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if fields := self.request.query_params.get("fields", None):
            context.update({"fields": fields.split(",")})
        if exclude_fields := self.request.query_params.get("exclude_fields", None):
            context.update({"exclude_fields": exclude_fields.split(",")})
        return context

    @action(methods=["get"], detail=False, url_path="simplified_list")
    def simplified_application_list(self, request):
        context = self.get_serializer_context()
        qs = self._get_simplified_queryset(request, context)
        qs = qs.exclude(
            status=ApplicationStatus.DRAFT,
            application_origin=ApplicationOrigin.APPLICANT,
        )
        serializer = self.serializer_class(qs, many=True, context=context)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=["GET"], detail=False)
    def export_csv(self, request) -> StreamingHttpResponse:
        queryset = self.get_queryset()
        filtered_queryset = self.filter_queryset(queryset)
        return self._csv_response(filtered_queryset)

    APPLICATION_ORDERING = "application_number"

    @action(methods=["GET"], detail=False)
    @transaction.atomic
    def batch_pdf_files(self, request) -> HttpResponse:
        batch_id = request.query_params.get("batch_id")
        if batch_id:
            apps = Application.objects.filter(batch_id=batch_id)
            return self._csv_pdf_response(apps)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["GET"], detail=False)
    @transaction.atomic
    def batch_p2p_file(self, request) -> HttpResponse:
        batch_id = request.query_params.get("batch_id")
        if batch_id:
            apps = Application.objects.filter(batch_id=batch_id)
            return self._csv_response(apps, True, True)
        return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["GET"], detail=False)
    @transaction.atomic
    def export_new_accepted_applications_csv_pdf(self, request) -> HttpResponse:
        return self._csv_pdf_response(
            self._create_application_batch(ApplicationStatus.ACCEPTED), True, True
        )

    @action(methods=["GET"], detail=False)
    @transaction.atomic
    def export_new_rejected_applications_csv_pdf(self, request) -> HttpResponse:
        return self._csv_pdf_response(
            self._create_application_batch(ApplicationStatus.REJECTED)
        )

    def _create_application_batch(self, status) -> QuerySet[Application]:
        """
        Create a new application batch out of the existing applications in the given status
        that are not yet assigned to a batch.
        """
        queryset = self.get_queryset().filter(status=status, batch__isnull=True)
        status_map = {
            ApplicationStatus.ACCEPTED: ApplicationBatchStatus.DECIDED_ACCEPTED,
            ApplicationStatus.REJECTED: ApplicationBatchStatus.DECIDED_REJECTED,
        }
        if status not in status_map:
            assert False, "Internal error, should not happen"
        application_ids = [application.pk for application in queryset]
        if queryset:
            batch = ApplicationBatch.objects.create(
                proposal_for_decision=status_map[status]
            )
            queryset.update(batch=batch)
        return self.get_queryset().filter(pk__in=application_ids)

    @staticmethod
    def _export_filename_without_suffix():
        return format_lazy(
            _("Helsinki-lisan hakemukset viety {date}"),
            date=timezone.now().strftime("%Y%m%d_%H%M%S"),
        )

    def _csv_response(
        self,
        queryset: QuerySet[Application],
        prune_data_for_talpa: bool = False,
        remove_quotes: bool = False,
        prune_sensitive_data: bool = True,
    ) -> StreamingHttpResponse:
        csv_service = ApplicationsCsvService(
            queryset.order_by(self.APPLICATION_ORDERING),
            prune_data_for_talpa,
            prune_sensitive_data,
        )
        response = StreamingHttpResponse(
            csv_service.get_csv_string_lines_generator(remove_quotes),
            content_type="text/csv",
        )
        response["Content-Disposition"] = "attachment; filename={filename}.csv".format(
            filename=self._export_filename_without_suffix()
        )
        return response

    """Generate a response with a CSV file and PDF files containing application data.
        Optionally prune data and remove quotes from the CSV file for Talpa.
    """

    def _csv_pdf_response(
        self,
        queryset: QuerySet[Application],
        prune_data_for_talpa: bool = False,
        remove_quotes: bool = False,
    ) -> HttpResponse:
        ordered_queryset = queryset.order_by(self.APPLICATION_ORDERING)
        export_filename_without_suffix = self._export_filename_without_suffix()

        csv_file = prepare_csv_file(
            ordered_queryset, prune_data_for_talpa, export_filename_without_suffix
        )

        pdf_files: List[ExportFileInfo] = prepare_pdf_files(ordered_queryset)

        zip_file: bytes = generate_zip([csv_file] + pdf_files)
        zip_filename = f"{export_filename_without_suffix}.zip"

        response: HttpResponse = HttpResponse(
            zip_file, content_type="application/x-zip-compressed"
        )
        response["Content-Disposition"] = f"attachment; filename={zip_filename}"
        return response


class PrintDetail(APIView):
    renderer_classes = [TemplateHTMLRenderer]
    permission_classes = [BFIsApplicant]

    def get(self, request, *args, **kwargs):
        pk = kwargs["pk"]
        application = get_object_or_404(Application, pk=pk)
        self.check_object_permissions(request, application)

        if settings.DEBUG and request.query_params.get("as_html") == "1":
            context = get_context_for_summary_context(application)
            return Response(context, template_name="application.html")

        pdf = generate_application_summary_file(application) or None
        if pdf:
            return HttpResponse(pdf, "application/pdf")
        raise Exception("PDF error")
