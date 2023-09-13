import AttachmentsIngress from 'benefit/applicant/components/attachmentsIngress/AttachmentsIngress';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { ATTACHMENT_TYPES, BENEFIT_TYPES } from 'benefit-shared/constants';
import React from 'react';
import { $Hr } from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import StepperActions from '../stepperActions/StepperActions';
import AttachmentsList from './attachmentsList/AttachmentsList';
import { useApplicationFormStep3 } from './useApplicationFormStep3';

const ApplicationFormStep3: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const {
    handleBack,
    handleNext,
    handleSave,
    handleDelete,
    benefitType,
    apprenticeshipProgram,
    paySubsidyGranted,
    showSubsidyMessage,
    attachments,
    hasRequiredAttachments,
  } = useApplicationFormStep3(data);

  const theme = useTheme();

  return (
    <>
      <AttachmentsIngress />
      <ul>
        {(benefitType === BENEFIT_TYPES.SALARY ||
          benefitType === BENEFIT_TYPES.EMPLOYMENT ||
          benefitType === BENEFIT_TYPES.UNCLARIFIED) && (
          <>
            <AttachmentsList
              as="li"
              attachments={attachments}
              attachmentType={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
              required
            />
            {apprenticeshipProgram && (
              <AttachmentsList
                as="li"
                attachments={attachments}
                attachmentType={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
                required
              />
            )}
            {paySubsidyGranted && (
              <AttachmentsList
                as="li"
                attachments={attachments}
                attachmentType={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
                showMessage={showSubsidyMessage}
                required
              />
            )}
          </>
        )}
        {benefitType === BENEFIT_TYPES.COMMISSION && (
          <AttachmentsList
            as="li"
            attachments={attachments}
            attachmentType={ATTACHMENT_TYPES.COMMISSION_CONTRACT}
            required
          />
        )}
        <AttachmentsList
          as="li"
          attachments={attachments}
          attachmentType={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
        />
      </ul>
      <$Hr
        css={`
          margin: ${theme.spacing.l} 0;
        `}
      />
      <StepperActions
        disabledNext={!hasRequiredAttachments}
        handleSubmit={handleNext}
        handleSave={handleSave}
        handleBack={handleBack}
        handleDelete={handleDelete}
      />
    </>
  );
};

export default ApplicationFormStep3;
