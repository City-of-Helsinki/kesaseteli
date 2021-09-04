import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import Application from 'shared/types/employer-application';

const Step3Summary: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading, application, sendApplication } = useApplicationApi();

  const onSubmit = (completeApplication: Application): void =>
    sendApplication(completeApplication);

  const stepTitle = t('common:application.step3.header');
  return (
    <ApplicationForm stepTitle={stepTitle}>
      <FormSection
        header={stepTitle}
        loading={isLoading}
        tooltip={t('common:application.step3.tooltip')}
      >
        Yhteenveto: <p />
        <pre>{JSON.stringify(application, null, 2)}</pre>
        <ActionButtons onSubmit={onSubmit} />
      </FormSection>
    </ApplicationForm>
  );
};
export default Step3Summary;
