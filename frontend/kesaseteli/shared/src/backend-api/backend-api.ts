import isRealIntegrationsEnabled from '@frontend/shared/src/flags/is-real-integrations-enabled';

import isSuomiFiEnabled from '../flags/is-suomi-fi-enabled';

const suomiFiEndpoint = {
  LOGIN: '/saml2/login/',
  LOGOUT: '/saml2/logout/',
};

const helsinkiProfileEndpoint = {
  LOGIN: '/oidc/authenticate/',
  LOGOUT: '/oidc/logout/',
};

export const BackendEndpoint = {
  ADDITIONAL_INFO: '/v1/additional_info/',
  EMPLOYER_APPLICATIONS: '/v1/employerapplications/',
  EMPLOYER_SUMMER_VOUCHERS: '/v1/employersummervouchers/',
  ATTACHMENTS: '/attachments/',
  USER: '/oidc/userinfo/',
  YOUTH_APPLICATIONS: '/v1/youthapplications/',
  CREATE_YOUTH_APPLICATION_WITHOUT_SSN:
    '/v1/youthapplications/create-without-ssn/',
  EMPLOYMENT: '/v1/youthapplications/fetch_employee_data/',
  SCHOOLS: '/v1/schools/',
  ...(isRealIntegrationsEnabled() && isSuomiFiEnabled()
    ? suomiFiEndpoint
    : helsinkiProfileEndpoint),
} as const;

export const BackendEndPoints = Object.values(BackendEndpoint);

export type BackendPath = typeof BackendEndpoint[keyof typeof BackendEndpoint];

export const getBackendDomain = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:8000';

export const getBackendUrl = (path: BackendPath): string =>
  `${getBackendDomain()}${path}`;

export const getYouthApplicationQueryKey = (id: string): string =>
  `${BackendEndpoint.YOUTH_APPLICATIONS}${id}/`;

export const getYouthApplicationStatusQueryKey = (id: string): string =>
  `${getYouthApplicationQueryKey(id)}status/`;

export const getAdditionalInfoQueryKey = (id: string): string =>
  `${getYouthApplicationQueryKey(id)}additional_info/`;
