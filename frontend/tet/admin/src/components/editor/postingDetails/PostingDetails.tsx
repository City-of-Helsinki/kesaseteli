import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'styled-components';
import { $CompanyInfoRow } from 'tet/admin/components/editor/companyInfo/CompanyInfo.sc';
import DateInput from 'shared/components/forms/inputs/DateInput';
import TetPosting from 'tet/admin/types/tetposting';
import TextInput from 'shared/components/forms/inputs/TextInput';
import { EditorSectionProps } from 'tet/admin/components/editor/Editor';
import NumberInput from 'tet/admin/components/editor/NumberInput';

const PostingDetails: React.FC<EditorSectionProps> = ({ initialValue }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <FormSection header={t('common:editor.posting.header')}>
      <$GridCell
        as={$Grid}
        $colSpan={12}
        css={`
          row-gap: ${theme.spacing.xl};
        `}
      >
        <$GridCell $colSpan={6}>
          <TextInput<TetPosting>
            id="title"
            initialValue={initialValue.title}
            label={t('common:editor.posting.title')}
            placeholder={t('common:editor.posting.title')}
            registerOptions={{
              required: true,
            }}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput<TetPosting>
            id="start_date"
            label={t('common:editor.posting.startDateLabel')}
            initialValue={initialValue.start_date}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput<TetPosting>
            id="end_date"
            label={t('common:editor.posting.endDateLabel')}
            initialValue={initialValue.end_date}
            registerOptions={{
              required: false,
            }}
          />
        </$GridCell>
      </$GridCell>
      <$GridCell $colSpan={12}>
        <$CompanyInfoRow>{t('common:editor.posting.workHoursNotice')}</$CompanyInfoRow>
      </$GridCell>
      <$GridCell $colSpan={2}>
        <NumberInput id="spots" label={t('common:editor.posting.spotsLabel')} initialValue={initialValue.spots} />
      </$GridCell>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={6}>
          <TextInput<TetPosting>
            type="textArea"
            id="description"
            initialValue={initialValue.description}
            label={t('common:editor.posting.description')}
          />
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default PostingDetails;
