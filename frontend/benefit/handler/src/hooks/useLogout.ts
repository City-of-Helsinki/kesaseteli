import {
  BackendEndpoint,
  getBackendUrl,
} from 'benefit-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import React from 'react';

const useLogout = (): (() => Promise<boolean>) => {
  const router = useRouter();

  return React.useCallback(
    () => router.push(getBackendUrl(BackendEndpoint.OAUTH_LOGOUT)),
    [router]
  );
};

export default useLogout;
