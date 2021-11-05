from calculator.models import Calculation, CalculationRow, PaySubsidy, PreviousBenefit
from common.utils import update_object
from dateutil.relativedelta import relativedelta
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers


class CalculationRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalculationRow
        fields = [
            "row_type",
            "ordering",
            "description_fi",
            "amount",
        ]
        # CalculationRows are generated by the calculator and not directly editable.
        # Edit the source data instead and recalculate.
        read_only_fields = [
            "row_type",
            "ordering",
            "description_fi",
            "amount",
        ]


class CalculationSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)
    rows = CalculationRowSerializer(
        many=True, help_text="Calculation rows, generated by the calculator"
    )

    override_benefit_amount = serializers.DecimalField(
        allow_null=True,
        max_digits=Calculation.override_benefit_amount.field.max_digits,
        decimal_places=Calculation.override_benefit_amount.field.decimal_places,
        min_value=0,
    )

    CALCULATION_MAX_MONTHS = 24

    def _validate_date_range(self, start_date, end_date):
        # validation is more relaxed as it's assumed that the handlers know what they're doing
        if start_date + relativedelta(months=self.CALCULATION_MAX_MONTHS) <= end_date:
            raise serializers.ValidationError({"end_date": _("Date range too large")})

    def _validate_override_benefit_amount_comment(
        self, override_benefit_amount, override_benefit_amount_comment
    ):
        if not override_benefit_amount and override_benefit_amount_comment:
            raise serializers.ValidationError(
                {
                    "override_benefit_amount_comment": _(
                        "This calculation can not have a override_benefit_amount_comment"
                    )
                }
            )
        elif override_benefit_amount and not override_benefit_amount_comment:
            raise serializers.ValidationError(
                {
                    "override_benefit_amount_comment": _(
                        "This calculation needs override_benefit_amount_comment"
                    )
                }
            )

    def validate(self, data):
        self._validate_date_range(data.get("start_date"), data.get("end_date"))
        self._validate_override_benefit_amount_comment(
            data.get("override_benefit_amount"),
            data.get("override_benefit_amount_comment"),
        )
        return data

    def update(self, instance, validated_data):
        validated_data.pop("id")  # defensive programming
        validated_data.pop("rows")  # rows are not directly editable by handler
        update_object(instance, validated_data)
        instance.save()
        return instance

    class Meta:
        model = Calculation
        fields = [
            "id",
            "monthly_pay",
            "vacation_money",
            "other_expenses",
            "start_date",
            "end_date",
            "state_aid_max_percentage",
            "granted_as_de_minimis_aid",
            "target_group_check",
            "calculated_benefit_amount",
            "override_benefit_amount",
            "override_benefit_amount_comment",
            "rows",
        ]
        read_only_fields = ["id", "calculated_benefit_amount"]


class PaySubsidyListSerializer(serializers.ListSerializer):
    """
    https://www.django-rest-framework.org/api-guide/serializers/#customizing-multiple-update
    """

    def update(self, instance, validated_data):
        # Current pay_subsidies in the database. Maps for id->instance.
        pay_subsidy_mapping = {pay_subsidy.id: pay_subsidy for pay_subsidy in instance}
        # A list of ids of the validated data items. IDs do not exist for new instances.
        incoming_ids = [item["id"] for item in validated_data if item.get("id")]

        # Perform deletions before create/update, to avoid conflicting ordering values
        for pay_subsidy_id, pay_subsidy in pay_subsidy_mapping.items():
            if pay_subsidy_id not in incoming_ids:
                pay_subsidy.delete()

        # Perform creations and updates.
        ret = []
        for data in validated_data:
            pay_subsidy = pay_subsidy_mapping.get(data.get("id"), None)
            if pay_subsidy is None:
                ret.append(self.child.create(data))
            else:
                ret.append(self.child.update(pay_subsidy, data))
            # ordering field is not exposed in API, it is added in ApplicantApplicationSerializer
            if ordering := data.get("ordering"):
                ret[-1].ordering = ordering
                ret[-1].save()

        return ret


class PaySubsidySerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)

    class Meta:
        model = PaySubsidy
        fields = [
            "id",
            "start_date",
            "end_date",
            "pay_subsidy_percent",
            "work_time_percent",
            "disability_or_illness",
        ]
        read_only_fields = []

        list_serializer_class = PaySubsidyListSerializer


class PreviousBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreviousBenefit
        fields = [
            "id",
            "company",
            "social_security_number",
            "start_date",
            "end_date",
            "monthly_amount",
            "total_amount",
        ]
        read_only_fields = []
