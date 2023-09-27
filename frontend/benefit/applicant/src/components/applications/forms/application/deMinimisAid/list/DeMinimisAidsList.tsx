import { $Notification } from 'benefit/applicant/components/Notification/Notification.sc';
import { MAX_DEMINIMIS_AID_TOTAL_AMOUNT } from 'benefit/applicant/constants';
import { DE_MINIMIS_AID_KEYS } from 'benefit-shared/constants';
import { Button, IconMinusCircle } from 'hds-react';
import sumBy from 'lodash/sumBy';
import React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatStringFloatValue } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import { $DeMinimisGrid } from '../deMinimisAid.sc';
import { useDeminimisAidsList } from './useDeminimisAidsList';

const DeMinimisAidsList: React.FC = () => {
  const { grants, t, translationsBase, handleRemove } = useDeminimisAidsList();
  const theme = useTheme();

  return (
    <>
      {grants?.map((grant, i) => (
        <$DeMinimisGrid
          key={`${grant[DE_MINIMIS_AID_KEYS.GRANTER] ?? ''}${
            grant[DE_MINIMIS_AID_KEYS.AMOUNT] ?? ''
          }${grant[DE_MINIMIS_AID_KEYS.GRANTED_AT] ?? ''}`}
        >
          <$GridCell
            css="margin-left: 15px"
            $colSpan={12}
            as={$Grid}
            columns={12}
            alignItems="center"
            bgHorizontalPadding
          >
            <$GridCell $colSpan={4}>
              {grant[DE_MINIMIS_AID_KEYS.GRANTER]}
            </$GridCell>
            <$GridCell $colSpan={2}>{`${formatStringFloatValue(
              grant[DE_MINIMIS_AID_KEYS.AMOUNT]
            )} €`}</$GridCell>
            <$GridCell $colSpan={2}>
              {convertToUIDateFormat(grant[DE_MINIMIS_AID_KEYS.GRANTED_AT])}
            </$GridCell>
            <$GridCell
              $colSpan={4}
              css={`
                margin-left: auto;
                margin-bottom: ${theme.spacing.s};
                padding-left: ${theme.spacing.s};
              `}
            >
              <Button
                onClick={() => handleRemove(i)}
                variant="secondary"
                theme="black"
                iconLeft={<IconMinusCircle />}
                fullWidth
                data-testid={`deminimis-remove-${i}`}
              >
                {t(`${translationsBase}.deMinimisAidsRemove`)}
              </Button>
            </$GridCell>
          </$GridCell>
        </$DeMinimisGrid>
      ))}
      {sumBy(grants, (grant) => Number(grant.amount)) >
        MAX_DEMINIMIS_AID_TOTAL_AMOUNT && (
        <$GridCell
          $colSpan={8}
          $colStart={3}
          data-testid="deminimis-maxed-notification"
        >
          <$Notification
            label={t(
              `${translationsBase}.notifications.deMinimisAidMaxAmount.label`
            )}
            type="error"
          >
            {t(
              `${translationsBase}.notifications.deMinimisAidMaxAmount.content`
            )}
          </$Notification>
        </$GridCell>
      )}
    </>
  );
};

export default DeMinimisAidsList;
