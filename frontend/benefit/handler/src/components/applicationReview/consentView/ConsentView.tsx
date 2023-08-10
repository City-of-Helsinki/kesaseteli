import AttachmentsListView from 'benefit/handler/components/attachmentsListView/AttachmentsListView';
import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
} from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import ConsentActions from './consentActions/ConsentActions';

const ConsentView: React.FC<ApplicationReviewViewProps> = ({
  data,
  isUploading,
  handleUpload,
}) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading9`)}
      action={
        data.status !== APPLICATION_STATUSES.RECEIVED ? (
          <ConsentActions
            isUploading={isUploading}
            handleUpload={handleUpload}
          />
        ) : null
      }
    >
      <$GridCell $colSpan={12}>
        <AttachmentsListView
          type={ATTACHMENT_TYPES.EMPLOYEE_CONSENT}
          attachments={data.attachments || []}
        />
      </$GridCell>
    </ReviewSection>
  );
};

export default ConsentView;
