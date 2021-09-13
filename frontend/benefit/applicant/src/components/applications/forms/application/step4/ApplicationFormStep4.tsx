import { $SupplementaryButton } from 'benefit/applicant/components/applications/Applications.sc';
import { ATTACHMENT_TYPES, BENEFIT_TYPES } from 'benefit/applicant/constants';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { IconPen } from 'hds-react';
import * as React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';

import StepperActions from '../stepperActions/StepperActions';
import AttachmentsListView from './attachmentsListView/AttachmentsListView';
import CompanyInfoView from './companyInfoView/CompanyInfoView';
import EmployeeView from './employeeView/EmployeeView';
import { useApplicationFormStep4 } from './useApplicationFormStep4';

const ApplicationFormStep4: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const {
    t,
    handleBack,
    handleNext,
    handleStepChange,
    translationsBase,
  } = useApplicationFormStep4(data);
  return (
    <>
      <CompanyInfoView data={data} />
      <EmployeeView data={data} />

      <FormSection
        header={t(`${translationsBase}.attachments.heading1`)}
        action={
          <$SupplementaryButton
            onClick={() => handleStepChange(3)}
            variant="supplementary"
            iconLeft={<IconPen />}
          >
            {t(`common:applications.actions.edit`)}
          </$SupplementaryButton>
        }
      >
        <>
          {(data.benefitType === BENEFIT_TYPES.EMPLOYMENT ||
            data.benefitType === BENEFIT_TYPES.SALARY) && (
            <>
              <AttachmentsListView
                type={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
                title={t(
                  `${translationsBase}.attachments.types.employmentContract.title`
                )}
                attachments={data.attachments || []}
              />
              <AttachmentsListView
                type={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
                title={t(
                  `${translationsBase}.attachments.types.paySubsidyDecision.title`
                )}
                attachments={data.attachments || []}
              />
              <AttachmentsListView
                type={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
                title={t(
                  `${translationsBase}.attachments.types.educationContract.title`
                )}
                attachments={data.attachments || []}
              />
            </>
          )}
        </>
        {data.benefitType === BENEFIT_TYPES.COMMISSION && (
          <AttachmentsListView
            type={ATTACHMENT_TYPES.COMMISSION_CONTRACT}
            title={t(
              `${translationsBase}.attachments.types.commissionContract.title`
            )}
            attachments={data.attachments || []}
          />
        )}
        <AttachmentsListView
          type={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
          title={t(
            `${translationsBase}.attachments.types.helsinkiBenefitVoucher.title`
          )}
          attachments={data.attachments || []}
        />
      </FormSection>

      <StepperActions
        hasBack
        hasNext
        handleSubmit={handleNext}
        handleBack={handleBack}
      />
    </>
  );
};

export default ApplicationFormStep4;
