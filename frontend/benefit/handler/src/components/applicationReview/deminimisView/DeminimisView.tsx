import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { ApplicationReviewViewProps } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { DeMinimisAid } from 'benefit-shared/types/application';
import sumBy from 'lodash/sumBy';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $SummaryTableHeader,
  $SummaryTableValue,
  $ViewField,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

const DeminimisView: React.FC<ApplicationReviewViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <ReviewSection
      header={t(`${translationsBase}.headings.heading3`)}
      action={data.status !== APPLICATION_STATUSES.RECEIVED ? <span /> : null}
      section="deMinimisAids"
    >
      {data.deMinimisAidSet && data.deMinimisAidSet?.length > 0 ? (
        <>
          <$GridCell $colSpan={3}>
            <$ViewField>
              {t(`${translationsBase}.fields.deMinimisAidsYes`)}
            </$ViewField>
            <$SummaryTableHeader>
              {t(`${translationsBase}.fields.deMinimisAidGranter`)}
            </$SummaryTableHeader>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <$SummaryTableHeader>
              {t(`${translationsBase}.fields.deMinimisAidAmount`)}
            </$SummaryTableHeader>
          </$GridCell>
          <$GridCell>
            <$SummaryTableHeader>
              {t(`${translationsBase}.fields.deMinimisAidGrantedAt`)}
            </$SummaryTableHeader>
          </$GridCell>
          {data.deMinimisAidSet?.map((aid: DeMinimisAid) => (
            <React.Fragment
              key={`${aid.granter ?? ''}${convertToUIDateFormat(
                aid.grantedAt
              )}`}
            >
              <$GridCell $colStart={1} $colSpan={3}>
                <$SummaryTableValue>{aid.granter}</$SummaryTableValue>
              </$GridCell>
              <$GridCell $colSpan={2}>
                <$SummaryTableValue>{`${formatFloatToCurrency(
                  aid.amount || '',
                  null
                )} €`}</$SummaryTableValue>
              </$GridCell>
              <$GridCell>
                <$SummaryTableValue>
                  {aid.grantedAt ? convertToUIDateFormat(aid.grantedAt) : ''}
                </$SummaryTableValue>
              </$GridCell>
            </React.Fragment>
          ))}
          <$GridCell $colStart={1} $colSpan={3}>
            <$SummaryTableValue isBold>
              {t(`${translationsBase}.fields.deMinimisAidTotal`)}
            </$SummaryTableValue>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <$SummaryTableValue isBold>
              {formatFloatToCurrency(
                sumBy(data.deMinimisAidSet, (grant) => Number(grant.amount)),
                'EUR'
              )}
            </$SummaryTableValue>
          </$GridCell>
        </>
      ) : (
        <$GridCell $colSpan={12}>
          <$ViewField>
            {t(`${translationsBase}.fields.deMinimisAidsNo`)}
          </$ViewField>
        </$GridCell>
      )}
    </ReviewSection>
  );
};

export default DeminimisView;
