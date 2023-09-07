import {
  APPLICATION_FIELD_KEYS,
  APPLICATION_START_DATE,
} from 'benefit/handler/constants';
import { useAlertBeforeLeaving } from 'benefit/handler/hooks/useAlertBeforeLeaving';
import { useDependentFieldsEffect } from 'benefit/handler/hooks/useDependentFieldsEffect';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';
import {
  ATTACHMENT_TYPES,
  BENEFIT_TYPES,
  ORGANIZATION_TYPES,
} from 'benefit-shared/constants';
import {
  ApplicationData,
  DeMinimisAid,
  TextProp,
} from 'benefit-shared/types/application';
import { FormikProps } from 'formik';
import { DateInput, SelectionGroup, TextInput } from 'hds-react';
import React from 'react';
import FieldLabel from 'shared/components/forms/fields/fieldLabel/FieldLabel';
import {
  $Checkbox,
  $RadioButton,
} from 'shared/components/forms/fields/Fields.sc';
import Heading from 'shared/components/forms/heading/Heading';
import FormSection from 'shared/components/forms/section/FormSection';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { BenefitAttachment } from 'shared/types/attachment';
import { OptionType } from 'shared/types/common';
import {
  formatStringFloatValue,
  stringFloatToFixed,
} from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import AttachmentsList from './attachmentsList/AttachmentsList';
import CompanySection from './companySection/CompanySection';
import { $Description } from './FormContent.sc';
import { useFormContent } from './useFormContent';

type Props = {
  application: Application;
  formik: FormikProps<Partial<Application>>;
  fields: ApplicationFields;
  handleSave: () => void;
  handleQuietSave: () => Promise<ApplicationData | void>;
  showDeminimisSection: boolean;
  minEndDate: Date;
  maxEndDate: Date | undefined;
  setEndDate: () => void;
  getSelectValue: (fieldName: keyof Application) => OptionType | null;
  subsidyOptions: OptionType[];
  deMinimisAidSet: DeMinimisAid[];
  attachments: BenefitAttachment[];
  checkedConsentArray: boolean[];
  getConsentErrorText: (consentIndex: number) => string;
  handleConsentClick: (consentIndex: number) => void;
};

const FormContent: React.FC<Props> = ({
  application,
  formik,
  fields,
  handleSave,
  handleQuietSave,
  showDeminimisSection,
  minEndDate,
  maxEndDate,
  setEndDate,
  deMinimisAidSet,
  attachments,
  checkedConsentArray,
  getConsentErrorText,
  handleConsentClick,
}) => {
  const {
    t,
    languageOptions,
    translationsBase,
    language,
    cbPrefix,
    textLocale,
    clearDeminimisAids,
    clearBenefitValues,
    clearDatesValues,
    clearCommissionValues,
    clearContractValues,
    clearPaySubsidyValues,
    clearAlternativeAddressValues,
    getErrorMessage,
  } = useFormContent(formik, fields);

  const theme = useTheme();
  useAlertBeforeLeaving(formik.dirty);

  useDependentFieldsEffect(
    {
      associationHasBusinessActivities:
        formik.values.associationHasBusinessActivities,
      apprenticeshipProgram: formik.values.apprenticeshipProgram,
      benefitType: formik.values.benefitType,
      subsidyGranted: formik.values.subsidyGranted,
      startDate: formik.values.startDate,
      useAlternativeAddress: formik.values.useAlternativeAddress,
    },
    {
      isFormDirty: formik.dirty,
      clearDeminimisAids,
      clearBenefitValues,
      clearDatesValues,
      clearCommissionValues,
      clearContractValues,
      clearPaySubsidyValues,
      clearAlternativeAddressValues,
      setEndDate,
    }
  );

  const isAbleToSelectEmploymentBenefit =
    application?.company?.organizationType !== ORGANIZATION_TYPES.ASSOCIATION ||
    (application?.company?.organizationType ===
      ORGANIZATION_TYPES.ASSOCIATION &&
      application?.associationHasBusinessActivities);
  const isAbleToSelectSalaryBenefit = formik.values.subsidyGranted === true;

  return (
    <form onSubmit={handleSave} noValidate>
      <CompanySection
        t={t}
        translationsBase={translationsBase}
        application={application}
        formik={formik}
        fields={fields}
        getErrorMessage={getErrorMessage}
        languageOptions={languageOptions}
        showDeminimisSection={showDeminimisSection}
        deMinimisAidSet={deMinimisAidSet}
      />
      <FormSection
        paddingBottom
        withoutDivider
        header={t(`${translationsBase}.headings.employment1`)}
      >
        <$GridCell $colSpan={3}>
          <TextInput
            id={fields.employee.firstName.name}
            name={fields.employee.firstName.name}
            label={fields.employee.firstName.label}
            placeholder={fields.employee.firstName.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.employee?.firstName ?? ''}
            invalid={!!getErrorMessage(fields.employee.firstName.name)}
            aria-invalid={!!getErrorMessage(fields.employee.firstName.name)}
            errorText={getErrorMessage(fields.employee.firstName.name)}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <TextInput
            id={fields.employee.lastName.name}
            name={fields.employee.lastName.name}
            label={fields.employee.lastName.label}
            placeholder={fields.employee.lastName.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.employee?.lastName ?? ''}
            invalid={!!getErrorMessage(fields.employee.lastName.name)}
            aria-invalid={!!getErrorMessage(fields.employee.lastName.name)}
            errorText={getErrorMessage(fields.employee.lastName.name)}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={2}>
          <TextInput
            id={fields.employee.socialSecurityNumber.name}
            name={fields.employee.socialSecurityNumber.name}
            label={fields.employee.socialSecurityNumber.label}
            placeholder={fields.employee.socialSecurityNumber.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.employee?.socialSecurityNumber ?? ''}
            invalid={
              !!getErrorMessage(fields.employee.socialSecurityNumber.name)
            }
            aria-invalid={
              !!getErrorMessage(fields.employee.socialSecurityNumber.name)
            }
            errorText={getErrorMessage(
              fields.employee.socialSecurityNumber.name
            )}
            required
          />
        </$GridCell>
        <$GridCell
          $colStart={1}
          $colSpan={6}
          css={`
            margin-top: ${theme.spacing.l};
          `}
        >
          <FieldLabel
            value={fields.employee.isLivingInHelsinki.label}
            required
          />
          <$Checkbox
            id={fields.employee.isLivingInHelsinki.name}
            name={fields.employee.isLivingInHelsinki.name}
            label={fields.employee.isLivingInHelsinki.placeholder}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            aria-invalid={
              !!getErrorMessage(fields.employee.isLivingInHelsinki.name)
            }
            errorText={getErrorMessage(fields.employee.isLivingInHelsinki.name)}
            required
            checked={formik.values.employee?.isLivingInHelsinki === true}
          />
        </$GridCell>
      </FormSection>
      <FormSection
        paddingBottom
        withoutDivider
        header={t(`${translationsBase}.headings.employment2`)}
      >
        <$GridCell $colSpan={8}>
          <SelectionGroup
            id={fields.paySubsidyGranted.name}
            label={fields.paySubsidyGranted.label}
            direction="vertical"
            required
            errorText={getErrorMessage(fields.paySubsidyGranted.name)}
          >
            <$RadioButton
              id={`${fields.paySubsidyGranted.name}False`}
              name={fields.paySubsidyGranted.name}
              value="false"
              label={t(
                `${translationsBase}.fields.${fields.paySubsidyGranted.name}.no`
              )}
              onBlur={formik.handleBlur}
              onChange={() => {
                formik.setFieldValue(fields.paySubsidyGranted.name, false);
                formik.setFieldValue(
                  APPLICATION_FIELD_KEYS.APPRENTICESHIP_PROGRAM,
                  null
                );
              }}
              checked={formik.values.paySubsidyGranted === false}
            />
            <$RadioButton
              id={`${fields.paySubsidyGranted.name}True`}
              name={fields.paySubsidyGranted.name}
              value="true"
              label={t(
                `${translationsBase}.fields.${fields.paySubsidyGranted.name}.yes`
              )}
              onBlur={formik.handleBlur}
              onChange={() => {
                formik.setFieldValue(fields.paySubsidyGranted.name, true);
              }}
              checked={formik.values.subsidyGranted === true}
            />
          </SelectionGroup>
        </$GridCell>
        {formik.values.subsidyGranted && (
          <$GridCell
            as={$Grid}
            $colSpan={12}
            css={`
              row-gap: ${theme.spacing.xl};
            `}
          >
            <$GridCell $colSpan={3} $colStart={1}>
              <SelectionGroup
                label={fields.apprenticeshipProgram.label}
                id={fields.apprenticeshipProgram.name}
                direction="vertical"
                required
                errorText={getErrorMessage(fields.apprenticeshipProgram.name)}
              >
                <$RadioButton
                  id={`${fields.apprenticeshipProgram.name}False`}
                  name={fields.apprenticeshipProgram.name}
                  value="false"
                  label={t(
                    `${translationsBase}.fields.${fields.apprenticeshipProgram.name}.no`
                  )}
                  onChange={() => {
                    formik.setFieldValue(
                      fields.apprenticeshipProgram.name,
                      false
                    );
                  }}
                  checked={formik.values.apprenticeshipProgram === false}
                />
                <$RadioButton
                  id={`${fields.apprenticeshipProgram.name}True`}
                  name={fields.apprenticeshipProgram.name}
                  value="true"
                  label={t(
                    `${translationsBase}.fields.${fields.apprenticeshipProgram.name}.yes`
                  )}
                  onChange={() => {
                    formik.setFieldValue(
                      fields.apprenticeshipProgram.name,
                      true
                    );
                  }}
                  checked={formik.values.apprenticeshipProgram === true}
                />
              </SelectionGroup>
            </$GridCell>
          </$GridCell>
        )}
      </FormSection>
      <FormSection
        paddingBottom
        withoutDivider
        header={t(`${translationsBase}.headings.employment3`)}
      >
        <$GridCell $colSpan={6}>
          <SelectionGroup
            label={fields.benefitType.label}
            id={fields.benefitType.name}
            direction="vertical"
            required
            errorText={getErrorMessage(fields.benefitType.name)}
          >
            <$RadioButton
              id={`${fields.benefitType.name}Employment`}
              name={fields.benefitType.name}
              value={BENEFIT_TYPES.EMPLOYMENT}
              label={t(
                `${translationsBase}.fields.${fields.benefitType.name}.employment`
              )}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              checked={formik.values.benefitType === BENEFIT_TYPES.EMPLOYMENT}
              disabled={!isAbleToSelectEmploymentBenefit}
            />
            <$RadioButton
              id={`${fields.benefitType.name}Salary`}
              name={fields.benefitType.name}
              value={BENEFIT_TYPES.SALARY}
              label={t(
                `${translationsBase}.fields.${fields.benefitType.name}.salary`
              )}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              checked={formik.values.benefitType === BENEFIT_TYPES.SALARY}
              disabled={!isAbleToSelectSalaryBenefit}
            />
          </SelectionGroup>
        </$GridCell>
      </FormSection>

      <FormSection
        paddingBottom
        withoutDivider
        header={t(`${translationsBase}.headings.employment4`)}
      >
        <$GridCell $colStart={1} $colSpan={4}>
          <DateInput
            id={fields.startDate.name}
            name={fields.startDate.name}
            label={fields.startDate.label}
            placeholder={fields.startDate.placeholder}
            disabled={!formik.values.benefitType}
            language={language}
            onBlur={formik.handleBlur}
            onChange={(value) =>
              formik.setFieldValue(fields.startDate.name, value)
            }
            value={formik.values.startDate ?? ''}
            invalid={!!getErrorMessage(fields.startDate.name)}
            aria-invalid={!!getErrorMessage(fields.startDate.name)}
            errorText={getErrorMessage(fields.startDate.name)}
            minDate={APPLICATION_START_DATE}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={4}>
          <DateInput
            id={fields.endDate.name}
            name={fields.endDate.name}
            label={fields.endDate.label}
            placeholder={fields.endDate.placeholder}
            disabled={!formik.values.benefitType || !formik.values.startDate}
            language={language}
            onBlur={formik.handleBlur}
            onChange={(value) =>
              formik.setFieldValue(fields.endDate.name, value)
            }
            value={formik.values.endDate ?? ''}
            invalid={!!getErrorMessage(fields.endDate.name)}
            aria-invalid={!!getErrorMessage(fields.endDate.name)}
            errorText={getErrorMessage(fields.endDate.name)}
            initialMonth={!formik.values.endDate ? minEndDate : undefined}
            minDate={minEndDate}
            maxDate={maxEndDate}
            required
          />
        </$GridCell>
      </FormSection>
      <FormSection
        paddingBottom
        header={t(`${translationsBase}.headings.employment5Employment`)}
      >
        {!formik.values.benefitType ? (
          <$GridCell $colSpan={8}>
            {t(`${translationsBase}.messages.selectBenefitType`)}
          </$GridCell>
        ) : (
          <>
            <$GridCell $colSpan={4}>
              <TextInput
                id={fields.employee.jobTitle.name}
                name={fields.employee.jobTitle.name}
                label={fields.employee.jobTitle.label}
                placeholder={fields.employee.jobTitle.placeholder}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.employee?.jobTitle ?? ''}
                invalid={!!getErrorMessage(fields.employee.jobTitle.name)}
                aria-invalid={!!getErrorMessage(fields.employee.jobTitle.name)}
                errorText={getErrorMessage(fields.employee.jobTitle.name)}
                required
              />
            </$GridCell>
            <$GridCell $colSpan={3}>
              <TextInput
                id={fields.employee.workingHours.name}
                name={fields.employee.workingHours.name}
                label={fields.employee.workingHours.label}
                onBlur={formik.handleBlur}
                onChange={(e) =>
                  formik.setFieldValue(
                    fields.employee.workingHours.name,
                    stringFloatToFixed(e.target.value)
                  )
                }
                value={formatStringFloatValue(
                  formik.values.employee?.workingHours
                )}
                invalid={!!getErrorMessage(fields.employee.workingHours.name)}
                aria-invalid={
                  !!getErrorMessage(fields.employee.workingHours.name)
                }
                errorText={getErrorMessage(fields.employee.workingHours.name)}
                required
              />
            </$GridCell>
            <$GridCell $colSpan={3}>
              <TextInput
                id={fields.employee.collectiveBargainingAgreement.name}
                name={fields.employee.collectiveBargainingAgreement.name}
                label={fields.employee.collectiveBargainingAgreement.label}
                placeholder={
                  fields.employee.collectiveBargainingAgreement.placeholder
                }
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={
                  formik.values.employee?.collectiveBargainingAgreement ?? ''
                }
                invalid={
                  !!getErrorMessage(
                    fields.employee.collectiveBargainingAgreement.name
                  )
                }
                aria-invalid={
                  !!getErrorMessage(
                    fields.employee.collectiveBargainingAgreement.name
                  )
                }
                errorText={getErrorMessage(
                  fields.employee.collectiveBargainingAgreement.name
                )}
                required
              />
            </$GridCell>

            <$GridCell $colSpan={12}>
              <Heading
                as="h3"
                size="xs"
                header={t(
                  `${translationsBase}.headings.employment5EmploymentSub1`
                )}
              />
            </$GridCell>

            <$GridCell $colSpan={12}>
              {t(`${translationsBase}.salaryExpensesExplanation`)}
            </$GridCell>

            <$GridCell $colSpan={2}>
              <TextInput
                id={fields.employee.monthlyPay.name}
                name={fields.employee.monthlyPay.name}
                label={fields.employee.monthlyPay.label}
                onBlur={formik.handleBlur}
                onChange={(e) =>
                  formik.setFieldValue(
                    fields.employee.monthlyPay.name,
                    stringFloatToFixed(e.target.value)
                  )
                }
                value={formatStringFloatValue(
                  formik.values.employee?.monthlyPay
                )}
                invalid={!!getErrorMessage(fields.employee.monthlyPay.name)}
                aria-invalid={
                  !!getErrorMessage(fields.employee.monthlyPay.name)
                }
                errorText={getErrorMessage(fields.employee.monthlyPay.name)}
                required
              />
            </$GridCell>
            <$GridCell $colSpan={2}>
              <TextInput
                id={fields.employee.otherExpenses.name}
                name={fields.employee.otherExpenses.name}
                label={fields.employee.otherExpenses.label}
                onBlur={formik.handleBlur}
                onChange={(e) =>
                  formik.setFieldValue(
                    fields.employee.otherExpenses.name,
                    stringFloatToFixed(e.target.value)
                  )
                }
                value={formatStringFloatValue(
                  formik.values.employee?.otherExpenses
                )}
                invalid={!!getErrorMessage(fields.employee.otherExpenses.name)}
                aria-invalid={
                  !!getErrorMessage(fields.employee.otherExpenses.name)
                }
                errorText={getErrorMessage(fields.employee.otherExpenses.name)}
                required
              />
            </$GridCell>
            <$GridCell $colSpan={2}>
              <TextInput
                id={fields.employee.vacationMoney.name}
                name={fields.employee.vacationMoney.name}
                label={fields.employee.vacationMoney.label}
                onBlur={formik.handleBlur}
                onChange={(e) =>
                  formik.setFieldValue(
                    fields.employee.vacationMoney.name,
                    stringFloatToFixed(e.target.value)
                  )
                }
                value={formatStringFloatValue(
                  formik.values.employee?.vacationMoney
                )}
                invalid={!!getErrorMessage(fields.employee.vacationMoney.name)}
                aria-invalid={
                  !!getErrorMessage(fields.employee.vacationMoney.name)
                }
                errorText={getErrorMessage(fields.employee.vacationMoney.name)}
                required
              />
            </$GridCell>
          </>
        )}
      </FormSection>
      <FormSection
        paddingBottom
        withoutDivider
        header={t(`${translationsBase}.headings.attachments`)}
      >
        <$GridCell $colSpan={12}>
          <$Description>
            {t(`${translationsBase}.attachments.attachmentsIngress`)}
          </$Description>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <AttachmentsList
            attachments={attachments}
            attachmentType={ATTACHMENT_TYPES.FULL_APPLICATION}
            handleQuietSave={handleQuietSave}
            required
          />
        </$GridCell>
        <$GridCell $colSpan={12}>
          <AttachmentsList
            attachments={attachments}
            attachmentType={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
            handleQuietSave={handleQuietSave}
            required
          />
        </$GridCell>
        {formik.values.apprenticeshipProgram && (
          <$GridCell $colSpan={12}>
            <AttachmentsList
              attachments={attachments}
              attachmentType={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
              handleQuietSave={handleQuietSave}
              required
            />
          </$GridCell>
        )}
        {formik.values.paySubsidyGranted && (
          <$GridCell $colSpan={12}>
            <AttachmentsList
              attachments={attachments}
              attachmentType={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
              handleQuietSave={handleQuietSave}
              required
            />
          </$GridCell>
        )}
        <$GridCell $colSpan={12}>
          <AttachmentsList
            attachments={attachments}
            attachmentType={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
            handleQuietSave={handleQuietSave}
          />
        </$GridCell>
        <$GridCell $colSpan={12}>
          <AttachmentsList
            attachments={attachments}
            attachmentType={ATTACHMENT_TYPES.OTHER_ATTACHMENT}
            handleQuietSave={handleQuietSave}
          />
        </$GridCell>
      </FormSection>
      <FormSection
        paddingBottom
        withoutDivider
        header={t(`${translationsBase}.headings.validity`)}
      >
        {application?.applicantTermsInEffect?.applicantConsents.map(
          (consent, i) => (
            <$GridCell
              $colSpan={12}
              key={consent.id}
              css={`
                label {
                  font-weight: 500;
                }
              `}
            >
              <$Checkbox
                id={`${cbPrefix}_${consent.id}`}
                name={`${cbPrefix}_${i}`}
                label={`${consent[`text${textLocale}` as TextProp]} *`}
                required
                checked={checkedConsentArray[i]}
                errorText={getConsentErrorText(i)}
                aria-invalid={false}
                onChange={() => handleConsentClick(i)}
              />
            </$GridCell>
          )
        )}
      </FormSection>
    </form>
  );
};

export default FormContent;
