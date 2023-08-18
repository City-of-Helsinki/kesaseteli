import Axios from 'axios';
import React from 'react';
import { getLastCookieValue } from 'shared/cookies/get-last-cookie-value';
import { Headers } from 'shared/types/common';

import BackendAPIContext from './BackendAPIContext';

export interface BackendAPIProviderProps {
  baseURL: string;
  headers?: Headers;
}

const BackendAPIProvider: React.FC<BackendAPIProviderProps> = ({
  baseURL,
  headers,
  children,
}): JSX.Element => (
  <BackendAPIContext.Provider
    value={Axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': typeof window !== 'undefined' ? localStorage.getItem('csrfToken') : '',
        ...headers,
      },
      withCredentials: true,
    })}
  >
    {children}
  </BackendAPIContext.Provider>
);

export default BackendAPIProvider;
