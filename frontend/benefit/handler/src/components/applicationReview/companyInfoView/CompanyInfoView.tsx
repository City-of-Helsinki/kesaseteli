import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { Application } from 'benefit/handler/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $ViewField,
  $ViewFieldBold,
} from 'shared/components/benefit/summaryView/SummaryView.sc';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

export interface CompanyInfoViewProps {
  data: Application;
}

const CompanyInfoView: React.FC<CompanyInfoViewProps> = ({ data }) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  const theme = useTheme();
  // todo: add the association info in the bottom
  return (
    <>
      <ReviewSection header={t(`${translationsBase}.headings.heading1`)}>
        <$GridCell $colSpan={3}>
          <$ViewField>{data.company?.name}</$ViewField>
          <$ViewField>{`${t(`${translationsBase}.fields.businessId`)}: ${
            data.company?.businessId || ''
          }`}</$ViewField>
          <$ViewField>
            {`${t(`${translationsBase}.fields.bankAccountNumber`)}: ${
              data.companyBankAccountNumber || ''
            }`}
          </$ViewField>
        </$GridCell>
        <$GridCell $colSpan={3}>
          <$ViewField>{data.company?.streetAddress}</$ViewField>
          <$ViewField>{`${data.company?.postcode || ''} ${
            data.company?.city || ''
          }`}</$ViewField>
        </$GridCell>
        {data.alternativeCompanyStreetAddress && (
          <>
            <$GridCell
              $colSpan={12}
              css={`
                font-size: ${theme.fontSize.body.m};
                margin: ${theme.spacing.xs4} 0;
              `}
            >
              <$ViewFieldBold>
                {t(`${translationsBase}.headings.heading1Additional`)}
              </$ViewFieldBold>
            </$GridCell>
            <$GridCell $colSpan={3}>
              {data.companyDepartment && (
                <$ViewField>{data.companyDepartment}</$ViewField>
              )}
              <$ViewField>{data.alternativeCompanyStreetAddress}</$ViewField>
              <$ViewField>
                {[data.alternativeCompanyPostcode, data.alternativeCompanyCity]
                  .join(' ')
                  .trim()}
              </$ViewField>
            </$GridCell>
          </>
        )}
      </ReviewSection>
    </>
  );
};

export default CompanyInfoView;
