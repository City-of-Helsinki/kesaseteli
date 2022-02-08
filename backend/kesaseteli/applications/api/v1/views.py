import logging

from django.conf import settings
from django.core import exceptions
from django.db import transaction
from django.db.models import Func
from django.http import FileResponse, HttpResponse, HttpResponseRedirect, JsonResponse
from django.utils import translation
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from shared.audit_log.viewsets import AuditLoggingModelViewSet

from applications.api.v1.permissions import (
    ALLOWED_APPLICATION_UPDATE_STATUSES,
    ALLOWED_APPLICATION_VIEW_STATUSES,
    EmployerApplicationPermission,
    EmployerSummerVoucherPermission,
    get_user_company,
    StaffPermission,
)
from applications.api.v1.serializers import (
    AttachmentSerializer,
    EmployerApplicationSerializer,
    EmployerSummerVoucherSerializer,
    SchoolSerializer,
    YouthApplicationSerializer,
)
from applications.enums import ApplicationStatus, YouthApplicationRejectedReason
from applications.models import (
    EmployerApplication,
    EmployerSummerVoucher,
    School,
    YouthApplication,
)
from common.permissions import DenyAll, IsHandler

LOGGER = logging.getLogger(__name__)


class SchoolListView(ListAPIView):
    # PostgreSQL specific functionality:
    # - Custom sorter for name field to ensure finnish language sorting order.
    # - NOTE: This can be removed if the database is made to use collation fi_FI.UTF8
    # TODO: Remove this after fixing related GitHub workflows to use Finnish PostgreSQL
    _name_fi = Func(
        "name",
        function="fi-FI-x-icu",  # fi_FI.UTF8 would be best but wasn't available
        template='(%(expressions)s) COLLATE "%(function)s"',
    )

    queryset = School.objects.order_by(_name_fi.asc())
    serializer_class = SchoolSerializer

    def get_permissions(self):
        permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]


class YouthApplicationViewSet(AuditLoggingModelViewSet):
    queryset = YouthApplication.objects.all()
    serializer_class = YouthApplicationSerializer

    @action(methods=["get"], detail=True)
    def process(self, request, pk=None) -> HttpResponse:
        youth_application: YouthApplication = self.get_object()  # noqa: F841

        # TODO: Implement
        return HttpResponse(status=status.HTTP_501_NOT_IMPLEMENTED)

    @transaction.atomic
    @action(methods=["get"], detail=True)
    def activate(self, request, pk=None) -> HttpResponse:
        youth_application: YouthApplication = self.get_object()

        # Lock same person's applications to prevent activation of more than one of them
        same_persons_apps = YouthApplication.objects.select_for_update().filter(
            social_security_number=youth_application.social_security_number
        )
        list(same_persons_apps)  # Force evaluation of queryset to lock its rows

        if same_persons_apps.active().exists():
            return HttpResponseRedirect(youth_application.already_activated_page_url())
        elif youth_application.has_activation_link_expired:
            return HttpResponseRedirect(youth_application.expired_page_url())
        elif youth_application.activate():
            if settings.DISABLE_VTJ:
                LOGGER.info(
                    f"Activated youth application {youth_application.pk}: "
                    "VTJ is disabled, sending application to be processed by a handler"
                )
                youth_application.send_processing_email_to_handler(request)
            return HttpResponseRedirect(youth_application.activated_page_url())

        return HttpResponse(
            status=status.HTTP_401_UNAUTHORIZED,
            content="Unable to activate youth application",
        )

    @classmethod
    def error_response(cls, reason: YouthApplicationRejectedReason):
        return JsonResponse(status=status.HTTP_400_BAD_REQUEST, data=reason.json())

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # This function is based on CreateModelMixin class's create function.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Data is valid but let's check other criteria before creating the object
        email = serializer.validated_data["email"]
        social_security_number = serializer.validated_data["social_security_number"]

        if YouthApplication.is_email_or_social_security_number_active(
            email, social_security_number
        ):
            return self.error_response(YouthApplicationRejectedReason.ALREADY_ASSIGNED)
        elif YouthApplication.is_email_used(email):
            return self.error_response(YouthApplicationRejectedReason.EMAIL_IN_USE)

        # Data was valid and other criteria passed too, so let's create the object
        self.perform_create(serializer)

        # Send the localized activation email
        youth_application = serializer.instance
        was_email_sent = youth_application.send_activation_email(
            request, youth_application.language
        )

        if not was_email_sent:
            transaction.set_rollback(True)
            with translation.override(youth_application.language):
                return HttpResponse(
                    _("Failed to send activation email"),
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # Return success creating the object
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ["activate", "create"]:
            permission_classes = [AllowAny]
        elif self.action in ["process", "retrieve"]:
            permission_classes = [IsHandler]
        else:
            permission_classes = [DenyAll]
        return [permission() for permission in permission_classes]


class EmployerApplicationViewSet(AuditLoggingModelViewSet):
    queryset = EmployerApplication.objects.all()
    serializer_class = EmployerApplicationSerializer
    permission_classes = [IsAuthenticated, EmployerApplicationPermission]

    def get_queryset(self):
        """
        Fetch all DRAFT status applications of the user & company.
        Should inlcude only 1 application since we don't allow creation of multiple
        DRAFT applications per user & company.
        """
        queryset = (
            super()
            .get_queryset()
            .select_related("company")
            .prefetch_related("summer_vouchers")
        )

        user = self.request.user
        if user.is_anonymous:
            return queryset.none()

        user_company = get_user_company(self.request)

        return queryset.filter(
            company=user_company,
            user=user,
            status__in=ALLOWED_APPLICATION_VIEW_STATUSES,
        )

    def create(self, request, *args, **kwargs):
        """
        Allow only 1 (DRAFT) application per user & company.
        """
        if self.get_queryset().filter(status=ApplicationStatus.DRAFT).exists():
            raise ValidationError("Company & user can have only one draft application")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        Allow to update only DRAFT status applications.
        """
        instance = self.get_object()
        if instance.status not in ALLOWED_APPLICATION_UPDATE_STATUSES:
            raise ValidationError("Only DRAFT applications can be updated")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


class EmployerSummerVoucherViewSet(AuditLoggingModelViewSet):
    queryset = EmployerSummerVoucher.objects.all()
    serializer_class = EmployerSummerVoucherSerializer
    permission_classes = [
        IsAuthenticated,
        StaffPermission | EmployerSummerVoucherPermission,
    ]

    def get_queryset(self):
        """
        Fetch summer vouchers of DRAFT status applications of the user & company.
        """
        queryset = (
            super()
            .get_queryset()
            .select_related("application")
            .prefetch_related("attachments")
        )

        user = self.request.user
        if user.is_staff:
            return queryset
        elif user.is_anonymous:
            return queryset.none()

        user_company = get_user_company(self.request)

        return queryset.filter(
            application__company=user_company,
            application__user=user,
            application__status__in=ALLOWED_APPLICATION_VIEW_STATUSES,
        )

    def create(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def retrieve(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def list(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(
        methods=("POST",),
        detail=True,
        url_path="attachments",
        parser_classes=(MultiPartParser,),
    )
    def post_attachment(self, request, *args, **kwargs):
        """
        Upload a single file as attachment
        """
        obj = self.get_object()

        if obj.application.status not in ALLOWED_APPLICATION_UPDATE_STATUSES:
            raise ValidationError(
                "Attachments can be uploaded only for DRAFT applications"
            )

        # Validate request data
        serializer = AttachmentSerializer(
            data={
                "summer_voucher": obj.id,
                "attachment_file": request.data["attachment_file"],
                "content_type": request.data["attachment_file"].content_type,
                "attachment_type": request.data["attachment_type"],
            }
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        methods=(
            "GET",
            "DELETE",
        ),
        detail=True,
        url_path="attachments/(?P<attachment_pk>[^/.]+)",
    )
    def handle_attachment(self, request, attachment_pk, *args, **kwargs):
        obj = self.get_object()

        if request.method == "GET":
            """
            Read a single attachment as file
            """
            attachment = obj.attachments.filter(pk=attachment_pk).first()
            if not attachment or not attachment.attachment_file:
                return Response(
                    {
                        "detail": format_lazy(
                            _("File not found."),
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )
            return FileResponse(attachment.attachment_file)

        elif request.method == "DELETE":
            """
            Delete a single attachment as file
            """
            if obj.application.status not in ALLOWED_APPLICATION_UPDATE_STATUSES:
                raise ValidationError(
                    "Attachments can be deleted only for DRAFT applications"
                )

            if (
                obj.application.status
                not in AttachmentSerializer.ATTACHMENT_MODIFICATION_ALLOWED_STATUSES
            ):
                return Response(
                    {"detail": _("Operation not allowed for this application status.")},
                    status=status.HTTP_403_FORBIDDEN,
                )
            try:
                instance = obj.attachments.get(id=attachment_pk)
            except exceptions.ObjectDoesNotExist:
                return Response(
                    {"detail": _("File not found.")}, status=status.HTTP_404_NOT_FOUND
                )
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
