import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import {
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
} from 'benefit-shared/constants';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import AttachmentsListView from '../../attachmentsListView/AttachmentsListView';
import PaySubsidyActions from './PaySubsidyActions/PaysubsidyActions';

const PaySubsidyView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading6`)}
      action={
        data.status !== APPLICATION_STATUSES.RECEIVED ? (
          <PaySubsidyActions />
        ) : null
      }
    >
      <$GridCell $colSpan={12}>
        {data.paySubsidyGranted ? (
          <>
            <$ViewFieldBold>
              {t(`common:utility.${data.paySubsidyGranted ? 'yes' : 'no'}`)}
              <$ViewField isInline>{`, ${data.paySubsidyPercent || ''} % ${
                data.additionalPaySubsidyPercent
                  ? `${t('common:utility.and')} ${
                      data.additionalPaySubsidyPercent
                    } %`
                  : ''
              }`}</$ViewField>
            </$ViewFieldBold>
            <$ViewField>
              {t(`${translationsBase}.fields.apprenticeshipProgram`)}{' '}
              <$ViewFieldBold>
                {t(
                  `common:utility.${data.apprenticeshipProgram ? 'yes' : 'no'}`
                )}
              </$ViewFieldBold>
            </$ViewField>
          </>
        ) : (
          <$ViewField>
            {t(`${translationsBase}.fields.paySubsidyGranted`)}{' '}
            <$ViewFieldBold>{t('common:utility.no')}</$ViewFieldBold>
          </$ViewField>
        )}
      </$GridCell>
      <$GridCell $colSpan={12}>
        <AttachmentsListView
          title={t('common:attachments.types.paySubsidyDecision.title')}
          type={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
          attachments={data.attachments || []}
        />
      </$GridCell>
      <$GridCell $colSpan={12}>
        <AttachmentsListView
          title={t('common:attachments.types.educationContract.title')}
          type={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
          attachments={data.attachments || []}
        />
      </$GridCell>
    </ReviewSection>
  );
};

export default PaySubsidyView;
