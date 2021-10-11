import EmploymentFieldSummary from 'kesaseteli/employer/components/application/summary/EmploymentFieldSummary';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import { getApplicationFormFieldLabel as getLabel } from 'kesaseteli/employer/utils/application.utils';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import {
  EmployeeHiredWithoutVoucherAssessment,
  EmploymentExceptionReason,
} from 'shared/types/employment';

type Props = {
  index: number;
};

const EmploymentSummary: React.FC<Props> = ({ index }) => {
  const { getValue: getExceptionReason } =
    useApplicationFormField<EmploymentExceptionReason>(
      `summer_vouchers.${index}.summer_voucher_exception_reason`
    );
  const { getValue: getName } = useApplicationFormField<string>(
    `summer_vouchers.${index}.employee_name`
  );
  const { getValue: getSsn } = useApplicationFormField<string>(
    `summer_vouchers.${index}.employee_ssn`
  );
  const { getValue: getStartDate } = useApplicationFormField<string>(
    `summer_vouchers.${index}.employment_start_date`
  );
  const { getValue: getEndDate } = useApplicationFormField<string>(
    `summer_vouchers.${index}.employment_end_date`
  );
  const { getSummaryText: getWorkHoursSummary } =
    useApplicationFormField<number>(
      `summer_vouchers.${index}.employment_work_hours`
    );
  const { getSummaryText: getSalaryPaidSummary } =
    useApplicationFormField<number>(
      `summer_vouchers.${index}.employment_salary_paid`
    );
  const { getValue: getDescription } = useApplicationFormField<string>(
    `summer_vouchers.${index}.employment_description`
  );
  const { getValue: getHired } =
    useApplicationFormField<EmployeeHiredWithoutVoucherAssessment>(
      `summer_vouchers.${index}.hired_without_voucher_assessment`
    );

  const { t } = useTranslation();

  return (
    <>
      <FormSectionHeading
        header={`${getName() ?? ''} ${getSsn() ?? ''}`}
        size="s"
        as="h3"
        data-testid={`employee-info-${index}`}
      />
      <EmploymentFieldSummary
        fieldName="summer_voucher_exception_reason"
        index={index}
      >
        {t(
          `common:application.form.selectionGroups.summer_voucher_exception_reason.${
            getExceptionReason() ?? ''
          }`
        )}
      </EmploymentFieldSummary>
      <EmploymentFieldSummary fieldName="employee_postcode" index={index} />
      <EmploymentFieldSummary fieldName="employee_home_city" index={index} />
      <EmploymentFieldSummary fieldName="employee_phone_number" index={index} />
      <EmploymentFieldSummary fieldName="employment_postcode" index={index} />
      <EmploymentFieldSummary
        fieldName="summer_voucher_serial_number"
        index={index}
      />
      <EmploymentFieldSummary fieldName="employee_school" index={index} />
      {/* TODO: palkkatodistus, työsopimus attachments */}
      <EmploymentFieldSummary fieldName="employment" index={index}>
        {t('common:application.step2.employment')}: {getStartDate()} -{' '}
        {getEndDate()}
      </EmploymentFieldSummary>
      <EmploymentFieldSummary fieldName="employment_work_hours" index={index}>
        {getWorkHoursSummary()}, {getSalaryPaidSummary()}
      </EmploymentFieldSummary>
      {getDescription() && (
        <EmploymentFieldSummary
          fieldName="employment_description"
          index={index}
        />
      )}
      <EmploymentFieldSummary
        fieldName="hired_without_voucher_assessment"
        index={index}
      >
        {getLabel(t, 'hired_without_voucher_assessment')}:{' '}
        {t(
          `common:application.form.selectionGroups.hired_without_voucher_assessment.${
            getHired() ?? ''
          }`
        )}
      </EmploymentFieldSummary>
    </>
  );
};
export default EmploymentSummary;
