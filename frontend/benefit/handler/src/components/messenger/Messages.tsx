import { MESSAGE_TYPES } from 'benefit-shared/constants';
import { Message } from 'benefit-shared/types/application';
import camelCase from 'lodash/camelCase';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import MessageComponent from 'shared/components/messaging/Message';
import { $MessagesList } from 'shared/components/messaging/Messaging.sc';
import { MessageVariant } from 'shared/types/messages';

interface ComponentProps {
  data: Message[];
  variant: MessageVariant;
  withScroll?: boolean;
}

const Messages: React.FC<ComponentProps> = ({ data, variant, withScroll }) => {
  const { t } = useTranslation();
  const scrollMessagesRef = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    scrollMessagesRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  return (
    <$MessagesList variant={variant}>
      <>
        {data.map((message) => (
          <MessageComponent
            key={message.id}
            sender={
              message.messageType === MESSAGE_TYPES.NOTE
                ? message.sender ?? ''
                : t(`common:messenger.titles.${camelCase(message.messageType)}`)
            }
            date={message.modifiedAt || ''}
            text={message.content}
            isPrimary={message.messageType === MESSAGE_TYPES.HANDLER_MESSAGE}
            variant={variant}
          />
        ))}
        {withScroll && <div ref={scrollMessagesRef}></div>}
      </>
    </$MessagesList>
  );
};

export default Messages;
