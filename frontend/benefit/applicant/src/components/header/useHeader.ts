import { ROUTES, SUPPORTED_LANGUAGES } from 'benefit/applicant/constants';
import AppContext from 'benefit/applicant/context/AppContext';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { getLanguageOptions } from 'benefit/applicant/utils/common';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect, useMemo, useState } from 'react';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useGetLanguage from 'shared/hooks/useGetLanguage';
import isServerSide from 'shared/server/is-server-side';
import { NavigationItem, OptionType } from 'shared/types/common';

type ExtendedComponentProps = {
  t: TFunction;
  languageOptions: OptionType<string>[];
  navigationItems: NavigationItem[];
  isNavigationVisible: boolean;
  hasMessenger: boolean;
  handleLanguageChange: (newLanguage: SUPPORTED_LANGUAGES) => void;
  handleNavigationItemClick: (url: string) => void;
  unreadMessagesCount: number | undefined | null;
  setMessagesDrawerVisiblity: (state: boolean) => void;
  isMessagesDrawerVisible: boolean;
  canWriteNewMessages: boolean;
  isTabActive: (pathname: string) => boolean;
};

const isTabActive = (pathname: string): boolean => {
  if (!isServerSide()) {
    const stripLocale = (path: string): string =>
      path.replace(/\/(fi|en|sv)/, '') || '/';
    const pathnameWithoutLocale = stripLocale(pathname);
    const locationWithoutLocale = stripLocale(window.location.pathname);
    if (locationWithoutLocale === '/' && pathnameWithoutLocale === '/') {
      return true;
    }
    if (pathnameWithoutLocale !== '/') {
      return locationWithoutLocale.includes(pathnameWithoutLocale);
    }
  }
  return false;
};

const getNavigationUrl = (
  locale,
  navigationUriBase: string,
  route: ROUTES
): string => {
  const homeUrl = `${
    locale === SUPPORTED_LANGUAGES.FI ? '' : navigationUriBase
  }${ROUTES.HOME}`;
  if (route === ROUTES.HOME) return homeUrl;
  if (route === ROUTES.DECISIONS)
    return `${locale === SUPPORTED_LANGUAGES.FI ? '' : navigationUriBase}${
      ROUTES.DECISIONS
    }`;
  return homeUrl;
};

const useHeader = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const id = router?.query?.id?.toString() ?? '';
  const openDrawer = Boolean(router?.query?.openDrawer);
  const { axios } = useBackendAPI();
  const { isNavigationVisible } = React.useContext(AppContext);
  const getLanguage = useGetLanguage();
  const navigationUriBase =
    getLanguage() === SUPPORTED_LANGUAGES.FI ? '/' : `/${getLanguage()}`;
  const [hasMessenger, setHasMessenger] = useState<boolean>(false);
  const [unreadMessagesCount, setUnredMessagesCount] = useState<
    number | undefined | null
  >(null);
  const [isMessagesDrawerVisible, setMessagesDrawerVisiblity] =
    useState(openDrawer);
  const { setIsSidebarVisible } = React.useContext(AppContext);
  const { pathname, asPath, query } = router;

  const languageOptions = React.useMemo(
    (): OptionType<string>[] => getLanguageOptions(t, 'supportedLanguages'),
    [t]
  );

  const { data: application } = useApplicationQuery(id);

  const hasCorrectStatus = ![
    APPLICATION_STATUSES.CANCELLED,
    APPLICATION_STATUSES.ARCHIVAL,
  ].includes(application?.status);

  const canWriteNewMessages =
    hasCorrectStatus && !application?.archived_for_applicant;

  useEffect(() => {
    if (application?.unread_messages_count) {
      setUnredMessagesCount(application?.unread_messages_count);
    } else {
      setUnredMessagesCount(null);
    }
  }, [application]);

  useEffect(() => {
    if (isMessagesDrawerVisible && Number(unreadMessagesCount) > 0) {
      setUnredMessagesCount(null);
    }
  }, [isMessagesDrawerVisible, unreadMessagesCount]);

  useEffect(() => {
    if (openDrawer) {
      setMessagesDrawerVisiblity(true);
    }
  }, [openDrawer]);

  const status = React.useMemo(
    (): APPLICATION_STATUSES =>
      application?.status || APPLICATION_STATUSES.DRAFT,
    [application]
  );

  useEffect(() => {
    if (isMessagesDrawerVisible !== null) {
      setIsSidebarVisible(isMessagesDrawerVisible);
    }
  }, [isMessagesDrawerVisible, setIsSidebarVisible]);

  useEffect(() => {
    setHasMessenger(
      [
        APPLICATION_STATUSES.INFO_REQUIRED,
        APPLICATION_STATUSES.HANDLING,
        APPLICATION_STATUSES.REJECTED,
        APPLICATION_STATUSES.ACCEPTED,
        APPLICATION_STATUSES.CANCELLED,
      ].includes(status)
    );
  }, [status, setHasMessenger]);

  const handleLanguageChange = (newLanguage: SUPPORTED_LANGUAGES): void => {
    void axios.get(BackendEndpoint.USER_OPTIONS, {
      params: { lang: newLanguage },
    });

    void router.push({ pathname, query }, asPath, {
      locale: newLanguage,
    });
  };

  const handleNavigationItemClick = (url: string): void => {
    void router.push(url);
  };

  const navigationItems = useMemo<Array<NavigationItem>>(
    () => [
      {
        label: t('common:header.navigation.home'),
        url: getNavigationUrl(getLanguage(), navigationUriBase, ROUTES.HOME),
      },
      {
        label: t('common:header.navigation.decisions'),
        url: getNavigationUrl(
          getLanguage(),
          navigationUriBase,
          ROUTES.DECISIONS
        ),
      },
    ],
    [getLanguage, navigationUriBase, t]
  );

  return {
    t,
    handleLanguageChange,
    handleNavigationItemClick,
    setMessagesDrawerVisiblity,
    languageOptions,
    hasMessenger,
    unreadMessagesCount,
    isMessagesDrawerVisible,
    canWriteNewMessages,
    navigationItems,
    isNavigationVisible,
    isTabActive,
  };
};

export { useHeader };
