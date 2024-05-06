import 'react-toastify/dist/ReactToastify.css';
import 'hds-design-tokens';

import Footer from 'kesaseteli/handler/components/footer/Footer';
import Header from 'kesaseteli/handler/components/header/Header';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import createQueryClient from 'kesaseteli-shared/query-client/create-query-client';
import { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import BackendAPIProvider from 'shared/backend-api/BackendAPIProvider';
import BaseApp from 'shared/components/app/BaseApp';
import ConfirmDialog from 'shared/components/confirm-dialog/ConfirmDialog';
import Portal from 'shared/components/confirm-dialog/Portal';
import {
  DialogContext,
  DialogContextProvider,
} from 'shared/contexts/DialogContext';

const queryClient = createQueryClient();

const App: React.FC<AppProps> = (appProps: AppProps) => (
  <BackendAPIProvider baseURL={getBackendDomain()}>
    <QueryClientProvider client={queryClient}>
      <DialogContextProvider>
        <BaseApp header={<Header />} footer={<Footer />} {...appProps} />
        <Portal>
          <DialogContext.Consumer>
            {([state]) => <ConfirmDialog {...state} />}
          </DialogContext.Consumer>
        </Portal>
      </DialogContextProvider>
    </QueryClientProvider>
  </BackendAPIProvider>
);

export default appWithTranslation(App);
