import {
  doLogin,
  SuomiFiData,
} from '@frontend/shared/browser-tests/actions/login-action';
import { getHeaderComponents } from '@frontend/shared/browser-tests/components/header.components';
import { DEFAULT_LANGUAGE } from '@frontend/shared/src/i18n/i18n';
import User from '@frontend/shared/src/types/user';
import TestController from 'testcafe';

export const doEmployerLogin = async (
  t: TestController,
  lang = DEFAULT_LANGUAGE,
  cachedUser?: User
): Promise<SuomiFiData> => {
  const headerUser = await getHeaderComponents(t).headerUser();
  await headerUser.expectations.userIsLoggedOut();
  await headerUser.actions.clickloginButton();
  return doLogin(t, lang, cachedUser);
};
