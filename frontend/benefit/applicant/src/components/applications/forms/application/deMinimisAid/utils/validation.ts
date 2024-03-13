import { validateIsTodayOrPastDate } from '@frontend/benefit-shared/src/utils/dates';
import {
  DE_MINIMIS_AID_GRANTED_AT_MAX_DATE,
  DE_MINIMIS_AID_GRANTED_AT_MIN_DATE,
  MAX_DEMINIMIS_AID_TOTAL_AMOUNT,
} from 'benefit/applicant/constants';
import {
  DE_MINIMIS_AID_KEYS,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit-shared/constants';
import { DeMinimisAid } from 'benefit-shared/types/application';
import isBefore from 'date-fns/isBefore';
import { TFunction } from 'next-i18next';
import { convertToUIDateFormat, parseDate } from 'shared/utils/date.utils';
import { getNumberValue } from 'shared/utils/string.utils';
import * as Yup from 'yup';

export const getValidationSchema = (t: TFunction): Yup.SchemaOf<DeMinimisAid> =>
  Yup.object().shape({
    [DE_MINIMIS_AID_KEYS.GRANTER]: Yup.string()
      .required(VALIDATION_MESSAGE_KEYS.REQUIRED)
      .max(64, (param) => ({
        max: param.max,
        key: VALIDATION_MESSAGE_KEYS.STRING_MAX,
      })),
    [DE_MINIMIS_AID_KEYS.AMOUNT]: Yup.number()
      .transform((_value, originalValue) => getNumberValue(originalValue))
      .required(VALIDATION_MESSAGE_KEYS.REQUIRED)
      .typeError(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID)
      .min(0, (param) => ({
        min: param.min,
        key: VALIDATION_MESSAGE_KEYS.NUMBER_MIN,
      }))
      .max(MAX_DEMINIMIS_AID_TOTAL_AMOUNT, (param) => ({
        max: param.max,
        key: VALIDATION_MESSAGE_KEYS.NUMBER_MAX,
      })),
    [DE_MINIMIS_AID_KEYS.GRANTED_AT]: Yup.string()
      .typeError(VALIDATION_MESSAGE_KEYS.DATE_FORMAT)
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.DATE_MAX, {
          max: convertToUIDateFormat(DE_MINIMIS_AID_GRANTED_AT_MAX_DATE),
        }),
        test: (value) => validateIsTodayOrPastDate(value),
      })
      .test({
        message: t(VALIDATION_MESSAGE_KEYS.DATE_MIN, {
          min: convertToUIDateFormat(DE_MINIMIS_AID_GRANTED_AT_MIN_DATE),
        }),
        test: (value) => {
          if (!value) return false;

          const date = parseDate(value);

          if (date && isBefore(date, DE_MINIMIS_AID_GRANTED_AT_MIN_DATE)) {
            return false;
          }
          return true;
        },
      }),
    [DE_MINIMIS_AID_KEYS.ID]: Yup.string(),
  });
