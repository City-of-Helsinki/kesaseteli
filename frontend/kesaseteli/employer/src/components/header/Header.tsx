import useLogin from 'kesaseteli/employer/hooks/backend/useLogin';
import useLogout from 'kesaseteli/employer/hooks/backend/useLogout';
import useUserQuery from 'kesaseteli/employer/hooks/backend/useUserQuery';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import BaseHeader from 'shared/components/header/HeaderV3';
import { Language, SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { asPath } = router;

  const languageOptions = React.useMemo(
    (): OptionType<Language>[] =>
      SUPPORTED_LANGUAGES.map((language) => ({
        label: t(`common:languages.${language}`),
        value: language,
      })),
    [t]
  );

  const handleLanguageChange = React.useCallback(
    (lang: string): void => {
      void router.push(asPath, asPath, {
        locale: lang,
      });
    },
    [router, asPath]
  );

  const login = useLogin();
  const userQuery = useUserQuery();
  const logout = useLogout();

  const isLoginPage = asPath?.includes('/login');

  return (
    <BaseHeader
      title={t('common:appName')}
      skipToContentLabel={t('common:header.linkSkipToContent')}
      menuToggleAriaLabel={t('common:header.menuToggleAriaLabel')}
      languages={languageOptions}
      onLanguageChange={handleLanguageChange}
      login={
        !userQuery.isLoading
          ? {
              isAuthenticated: !isLoginPage && userQuery.isSuccess,
              loginLabel: t('common:header.loginLabel'),
              logoutLabel: t('common:header.logoutLabel'),
              onLogin: login,
              onLogout: logout,
              userName: userQuery.isSuccess ? userQuery.data.name : undefined,
              userAriaLabelPrefix: t('common:header.userAriaLabelPrefix'),
            }
          : undefined
      }
    />
  );
};

export default Header;
