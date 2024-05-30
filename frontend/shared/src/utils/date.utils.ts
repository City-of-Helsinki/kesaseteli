import formatDateStr from 'date-fns/format';
import isBefore from 'date-fns/isBefore';
import isFutureFn from 'date-fns/isFuture';
import isSameDay from 'date-fns/isSameDay';
import isValid from 'date-fns/isValid';
import { enGB as en, fi, sv } from 'date-fns/locale';
import parse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';
import startOfYear from 'date-fns/startOfYear';

import {
  DATE_BACKEND_REGEX,
  DATE_UI_REGEX,
  DATE_VTJ_REGEX,
} from '../constants';
import { DEFAULT_LANGUAGE, Language } from '../i18n/i18n';
import { isString } from './type-guards';

export const DATE_FORMATS = {
  UI_DATE: 'd.M.yyyy',
  DATE_AND_TIME: 'd.M.yyyy. HH:mm',
  BACKEND_DATE: 'yyyy-MM-dd',
  ISO_8601: 'yyyy-MM-ddTHH:mm:ss.sssZ',
  VTJ: 'yyyyMMdd',
};

const locales: Record<Language, Locale> = { fi, sv, en };

type AnyDate = string | Date | number | undefined;

export const isValidDate = (date?: string | number | Date | null): boolean =>
  date ? isValid(new Date(date)) : false;

/**
 * Format date string
 * @param date
 * @param format
 * @param locale
 * @returns {string}
 */
export const formatDate = (
  date?: Date | number | null,
  format = DATE_FORMATS.UI_DATE,
  locale: Language = DEFAULT_LANGUAGE
): string => {
  if (!date || !isValidDate(date)) {
    return '';
  }

  return formatDateStr(date, format, {
    locale: locales[locale],
  }).trim();
};

const getFormat = (dateAsString: string): string | undefined => {
  if (DATE_UI_REGEX.test(dateAsString)) {
    return DATE_FORMATS.UI_DATE;
  }
  if (DATE_BACKEND_REGEX.test(dateAsString)) {
    return DATE_FORMATS.BACKEND_DATE;
  }
  if (DATE_VTJ_REGEX.test(dateAsString)) {
    return DATE_FORMATS.VTJ;
  }
  if (isValidDate(parseISO(dateAsString))) {
    return DATE_FORMATS.ISO_8601;
  }
  return undefined;
};

export const parseDate = (date: AnyDate): Date | undefined => {
  if (!date) {
    return undefined;
  }
  if (!isString(date)) {
    return new Date(date);
  }
  const format = getFormat(date);
  if (!format) {
    return undefined;
  }
  if (format === DATE_FORMATS.ISO_8601) {
    return parseISO(date);
  }
  return parse(date, format, new Date());
};

export const isFuture = (date: Date): boolean => isFutureFn(date);

export const convertDateFormat = (
  date: AnyDate,
  toFormat = DATE_FORMATS.BACKEND_DATE
): string => {
  const parsedDate = parseDate(date);
  return formatDate(parsedDate, toFormat);
};

export const convertToUIDateFormat = (date: AnyDate): string =>
  convertDateFormat(date, DATE_FORMATS.UI_DATE);

export const convertToBackendDateFormat = (date: AnyDate): string =>
  convertDateFormat(date, DATE_FORMATS.BACKEND_DATE);

export const convertToUIDateAndTimeFormat = (date: AnyDate): string =>
  convertDateFormat(date, DATE_FORMATS.DATE_AND_TIME);

export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/**
 * Calculates the difference in days between 2 dates
 * Based on excelDays360
 *
 * @param startDate
 * Date1
 * @param endDate
 * Date2
 * @returns
 * Number of days
 */
export const days360 = (
  startDate: Date | undefined,
  endDate: Date | undefined,
  method = 'EU'
): number => {
  if (!endDate || !startDate) return 0;

  let startDay = startDate.getDate();
  const startMonth = startDate.getMonth();
  const startYear = startDate.getFullYear();
  let endDay = endDate.getDate();
  let endMonth = endDate.getMonth();
  let endYear = endDate.getFullYear();

  if (
    startDay === 31 ||
    (method !== 'EU' &&
      startMonth === 2 &&
      (startDay === 29 || (startDay === 28 && !isLeapYear(startYear))))
  )
    startDay = 30;

  if (endDay === 31) {
    if (method !== 'EU' && startDay !== 30) {
      endDay = 1;

      if (endMonth === 12) {
        endYear += 1;
        endMonth = 1;
      } else endMonth += 1;
    }

    endDay = 30;
  }

  return (
    endDay +
    endMonth * 30 +
    endYear * 360 -
    startDay -
    startMonth * 30 -
    startYear * 360
  );
};

/**
 * Calculates the different in months between 2 dates with two decimals accuracy
 * Based on excelDays360
 * @param endDate
 * Date1
 * @param startDate
 * Date2
 * @returns
 * Number of months
 */
export const diffMonths = (
  endDate: Date | undefined,
  startDate: Date | undefined,
  method = 'EU'
): number => {
  if (!endDate || !startDate) return 0;
  const correctEndDate = new Date(endDate);
  correctEndDate.setDate(correctEndDate.getDate() + 1);
  return Number((days360(startDate, correctEndDate, method) / 30).toFixed(2));
};

export const getCorrectEndDate = (
  startDate: AnyDate,
  endDate: AnyDate
): AnyDate => {
  const parsedStartDate = parseDate(startDate);
  const parsedEndDate = parseDate(endDate);

  if (!parsedStartDate || !parsedEndDate) return undefined;

  if (parsedStartDate > parsedEndDate) return startDate;

  return endDate;
};

export const validateDateIsFromCurrentYearOnwards = (
  date: AnyDate
): boolean => {
  const parsedDate = parseDate(date);
  return parsedDate ? parsedDate >= startOfYear(new Date()) : false;
};

export const isWithinInterval = (
  currDate: AnyDate,
  { startDate, endDate }: { startDate?: AnyDate; endDate?: AnyDate }
): boolean => {
  const curr = parseDate(currDate) ?? 0;
  const start = parseDate(startDate) ?? 0;
  const end = parseDate(endDate) ?? 0;
  return (!start || start <= curr) && (curr <= end || !end);
};

const compareDates = (aDate: Date, bDate: Date): number => {
  if (!aDate.getDate()) {
    return -1;
  }

  if (!bDate.getDate()) {
    return 1;
  }

  if (isSameDay(aDate, bDate)) {
    return 0;
  }

  if (isBefore(aDate, bDate)) {
    return -1;
  }

  return 1;
};

export const sortFinnishDate = (a: string, b: string): number => {
  const aDate = parse(a, 'dd.MM.yyyy', new Date());
  const bDate = parse(b, 'dd.MM.yyyy', new Date());
  return compareDates(aDate, bDate);
};

export const sortFinnishDateTime = (a: string, b: string): number => {
  const aDate = parse(a, 'dd.MM.yyyy. HH:mm', new Date());
  const bDate = parse(b, 'dd.MM.yyyy. HH:mm', new Date());
  return compareDates(aDate, bDate);
};
