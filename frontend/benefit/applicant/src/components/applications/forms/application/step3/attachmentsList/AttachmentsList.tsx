import { $PrimaryButton } from 'benefit/applicant/components/applications/Applications.sc';
import { ATTACHMENT_TYPES } from 'benefit/applicant/constants';
import { IconPlus } from 'hds-react';
import camelCase from 'lodash/camelCase';
import noop from 'lodash/noop';
import * as React from 'react';

import AttachmentItem from './attachmentItem/AttachmentItem';
import { $Container, $Heading, $Message } from './AttachmentsList.sc';
import { useAttachmentsList } from './useAttachmentsList';

interface AttachmentsContainerProps {
  attachmentType: ATTACHMENT_TYPES;
}

const AttachmentsList: React.FC<AttachmentsContainerProps> = ({
  attachmentType,
}) => {
  const { t, translationsBase, attachments } = useAttachmentsList();
  return (
    <$Container>
      <$Heading>
        {t(`${translationsBase}.types.${camelCase(attachmentType)}.title`)}
      </$Heading>
      {attachments.length > 0 ? (
        <>
          <AttachmentItem
            id="testId"
            name="palkkatukipaatos-teemurantamaki.PDF"
            removeText={t(`${translationsBase}.remove`)}
            onClick={noop}
            onRemove={noop}
          />
        </>
      ) : (
        <$Message>
          {t(`${translationsBase}.types.${camelCase(attachmentType)}.message`)}
        </$Message>
      )}
      <$PrimaryButton style={{ width: 'auto' }} iconLeft={<IconPlus />}>
        {t(`${translationsBase}.add`)}
      </$PrimaryButton>
    </$Container>
  );
};

export default AttachmentsList;
