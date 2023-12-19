import { Tab, TabPanel, Tabs } from 'hds-react';
import * as React from 'react';
import { $TabList } from 'shared/components/benefit/tabs/Tabs.sc';
import Drawer from 'shared/components/drawer/Drawer';
import Actions from 'shared/components/messaging/Actions';

import Messages from './Messages';
import { useMessenger } from './useMessenger';

interface ComponentProps {
  isOpen: boolean;
  onClose?: () => void;
  customItemsMessages?: React.ReactNode;
  canWriteNewMessages?: boolean;
}

const Messenger: React.FC<ComponentProps> = ({
  isOpen,
  onClose,
  customItemsMessages,
  canWriteNewMessages,
}) => {
  const { t, messages, handleSendMessage } = useMessenger(isOpen);

  return (
    <Drawer
      isOpen={isOpen}
      closeText={t('common:messenger.close')}
      onClose={onClose}
    >
      <Tabs>
        <$TabList position="start">
          <Tab>{t('common:messenger.messages')}</Tab>
        </$TabList>
        <TabPanel
          css={`
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          `}
        >
          <Messages data={messages} variant="message" withScroll />
          <Actions
            canWriteNewMessages={canWriteNewMessages}
            disabledText={t('common:messenger.cannotWriteNewMessages')}
            customItems={customItemsMessages}
            sendText={t('common:messenger.send')}
            errorText={t('common:form.validation.string.max', { max: 1024 })}
            placeholder={t('common:messenger.compose')}
            onSend={handleSendMessage}
          />
        </TabPanel>
      </Tabs>
    </Drawer>
  );
};

export default Messenger;
