import Header from 'benefit/applicant/components/header/Header';
import SupportingContent from 'benefit/applicant/components/supportingContent/SupportingContent';
import TermsOfService from 'benefit/applicant/components/termsOfService/TermsOfService';
import { IS_CLIENT, LOCAL_STORAGE_KEYS } from 'benefit/applicant/constants';
import dynamic from 'next/dynamic';
import * as React from 'react';
import useAuth from 'shared/hooks/useAuth';

import { $Main } from './Layout.sc';

const Footer = dynamic(
  () => import('benefit/applicant/components/footer/Footer'),
  { ssr: true }
);

type Props = { children: React.ReactNode };

const Layout: React.FC<Props> = ({ children, ...rest }) => {
  const { isAuthenticated } = useAuth();
  const [isTermsOfServiceApproved, setIsTermsOfSerivceApproved] =
    React.useState(false);

  React.useEffect(() => {
    if (IS_CLIENT) {
      setIsTermsOfSerivceApproved(
        // eslint-disable-next-line scanjs-rules/identifier_localStorage
        localStorage.getItem(
          LOCAL_STORAGE_KEYS.IS_TERMS_OF_SERVICE_APPROVED
        ) === 'true'
      );
    }
  }, []);

  return (
    <$Main {...rest}>
      <Header />
      {isAuthenticated && !isTermsOfServiceApproved ? (
        <TermsOfService
          setIsTermsOfSerivceApproved={setIsTermsOfSerivceApproved}
        />
      ) : (
        <>
          {children}
          <SupportingContent />
        </>
      )}
      <Footer />
    </$Main>
  );
};

export default Layout;
