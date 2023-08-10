import { $PageHeading } from 'benefit/applicant/components/applications/Applications.sc';
import { Button } from 'hds-react';
import { GetStaticProps } from 'next';
import React from 'react';
import Container from 'shared/components/container/Container';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell, $Hr } from 'shared/components/forms/section/FormSection.sc';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { openFileInNewTab } from 'shared/utils/file.utils';

import useApproveTermsOfServiceMutation from '../../hooks/useApproveTermsOfServiceMutation';
import useLogout from '../../hooks/useLogout';
import useTermsOfServiceData from '../../hooks/useTermsOfServiceData';
import PdfViewer from '../pdfViewer/PdfViewer';

type TermsOfServiceProps = {
  setIsTermsOfSerivceApproved: (isTermsOfServiceApproved: boolean) => void;
};

const TermsOfService: React.FC<TermsOfServiceProps> = ({
  setIsTermsOfSerivceApproved,
}) => {
  const { theme, t, termsInEffectUrl, user, approveTermsOfService } =
    useTermsOfServiceData(setIsTermsOfSerivceApproved);

  const { mutate } = useApproveTermsOfServiceMutation();

  const logout = useLogout();

  return (
    <Container>
      <FormSection withoutDivider data-testid="terms-of-service">
        <$GridCell
          $colStart={1}
          $colSpan={12}
          css={{ marginTop: theme.spacingLayout.l }}
        >
          <$PageHeading>{t('common:serviceName')}</$PageHeading>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <h2 css={{ marginBottom: 0 }}>
            {t('common:login.termsOfServiceHeader')}
          </h2>
        </$GridCell>
        <$GridCell
          $colSpan={12}
          css={`
            margin-bottom: var(--spacing-xl);
            margin-top: var(--spacing-xl);
          `}
        >
          <PdfViewer file={termsInEffectUrl} scale={1.8} />
        </$GridCell>
        <$GridCell
          $colSpan={5}
          css={`
            margin-bottom: var(--spacing-xl);
            margin-top: var(--spacing-xl);
          `}
        >
          <Button
            theme="black"
            variant="secondary"
            onClick={() => openFileInNewTab(termsInEffectUrl)}
          >
            {t('common:applications.actions.openTermsAsPDF')}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <$Hr />
        </$GridCell>
        <$GridCell $colSpan={7} css={{ display: 'flex' }}>
          <Button
            theme="coat"
            variant="primary"
            onClick={() =>
              user?.termsOfServiceApprovalNeeded
                ? mutate(user, {
                    onSuccess: () => approveTermsOfService(),
                  })
                : approveTermsOfService()
            }
            css={{ marginRight: theme.spacing.s }}
          >
            {t('common:applications.actions.continueToService')}
          </Button>
          <Button theme="black" variant="secondary" onClick={logout}>
            {t('common:applications.actions.pauseAndExit')}
          </Button>
        </$GridCell>
      </FormSection>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default TermsOfService;
