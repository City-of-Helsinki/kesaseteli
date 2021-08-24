import { Footer } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { $FooterWrapper } from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <$FooterWrapper>
      <Footer title={t('common:appName')} theme="dark">
        <Footer.Base
          copyrightHolder={t('common:copyrightText')}
          copyrightText={t('common:allRightsReservedText')}
        />
      </Footer>
    </$FooterWrapper>
  );
};

export default FooterSection;
