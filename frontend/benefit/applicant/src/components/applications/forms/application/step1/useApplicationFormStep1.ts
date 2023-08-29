import DeMinimisContext from 'benefit/applicant/context/DeMinimisContext';
import useCompanyQuery from 'benefit/applicant/hooks/useCompanyQuery';
import useFormActions from 'benefit/applicant/hooks/useFormActions';
import { useTranslation } from 'benefit/applicant/i18n';
import { getLanguageOptions } from 'benefit/applicant/utils/common';
import { getErrorText } from 'benefit/applicant/utils/forms';
import {
  APPLICATION_FIELDS_STEP1_KEYS,
  ORGANIZATION_TYPES,
} from 'benefit-shared/constants';
import { Application, DeMinimisAid } from 'benefit-shared/types/application';
import { FormikErrors, FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import { TFunction } from 'next-i18next';
import React, { useState } from 'react';
import { Field } from 'shared/components/forms/fields/types';
import showErrorToast from 'shared/components/toast/show-error-toast';
import { OptionType } from 'shared/types/common';
import { focusAndScroll } from 'shared/utils/dom.utils';

import { getValidationSchema } from './utils/validation';

type ExtendedComponentProps = {
  t: TFunction;
  fields: Record<
    APPLICATION_FIELDS_STEP1_KEYS,
    Field<APPLICATION_FIELDS_STEP1_KEYS>
  >;
  translationsBase: string;
  showDeminimisSection: boolean;
  getErrorMessage: (fieldName: string) => string | undefined;
  handleSubmit: () => void;
  handleSave: () => void;
  handleDelete?: () => void;
  clearDeminimisAids: () => void;
  formik: FormikProps<Partial<Application>>;
  deMinimisAidSet: DeMinimisAid[];
  languageOptions: OptionType[];
  getDefaultSelectValue: (fieldName: keyof Application) => OptionType;
};

type DeMinimisFormikPromises = Promise<
  [void | FormikErrors<Application>, void | FormikErrors<Application>]
>;

const hasBusinessActivitiesOrIsCompany = (
  hasBusinessActivities: boolean,
  organizationType: ORGANIZATION_TYPES
): boolean =>
  hasBusinessActivities === true ||
  organizationType === ORGANIZATION_TYPES.COMPANY;

const useApplicationFormStep1 = (
  application: Partial<Application>,
  isUnfinishedDeminimisAid: boolean
): ExtendedComponentProps => {
  const { t } = useTranslation();
  const { deMinimisAids, setDeMinimisAids } =
    React.useContext(DeMinimisContext);
  const { onNext, onSave, onDelete } = useFormActions(application);

  const translationsBase = 'common:applications.sections.company';
  // todo: check the isSubmitted logic, when its set to false and how affects the validation message
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { data } = useCompanyQuery();
  const organizationType = data?.organization_type;

  const formik = useFormik({
    initialValues: application,
    validationSchema: getValidationSchema(organizationType, t),
    validateOnChange: true,
    validateOnBlur: true,
    enableReinitialize: true,
    onSubmit: onNext,
  });

  const { values, touched, errors, setFieldValue } = formik;

  const isDeMinimisAidRowUnfinished = (): boolean => {
    if (isUnfinishedDeminimisAid) {
      showErrorToast(
        t(`${translationsBase}.notifications.deMinimisUnfinished.label`),
        t(`${translationsBase}.notifications.deMinimisUnfinished.content`)
      );
      return true;
    }

    return false;
  };

  const handleDeMinimisRadioButtonChange = (
    formikFields: ExtendedComponentProps['fields']
  ): Promise<void> | DeMinimisFormikPromises => {
    if (deMinimisAids.length === 0) {
      setDeMinimisAids([]);
      return Promise.all([
        formik.setFieldValue(formikFields.deMinimisAidSet.name, []),
        formik.setFieldValue(formikFields.deMinimisAid.name, false),
      ]);
    }
    return Promise.resolve();
  };

  const fields: ExtendedComponentProps['fields'] = React.useMemo(() => {
    const fieldMasks: Partial<Record<Field['name'], Field['mask']>> = {
      [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BANK_ACCOUNT_NUMBER]: {
        format: 'FI99 9999 9999 9999 99',
        stripVal: (val: string) => val.replace(/\s/g, ''),
      },
    };

    const fieldsValues = Object.values(APPLICATION_FIELDS_STEP1_KEYS);
    const fieldsPairs: [
      APPLICATION_FIELDS_STEP1_KEYS,
      Field<APPLICATION_FIELDS_STEP1_KEYS>
    ][] = fieldsValues.map((fieldName) => [
      fieldName,
      {
        name: fieldName,
        label: t(`${translationsBase}.fields.${fieldName}.label`),
        placeholder: t(`${translationsBase}.fields.${fieldName}.placeholder`),
        mask: fieldMasks[fieldName],
      },
    ]);

    return fromPairs(fieldsPairs) as Record<
      APPLICATION_FIELDS_STEP1_KEYS,
      Field<APPLICATION_FIELDS_STEP1_KEYS>
    >;
  }, [t, translationsBase]);

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(errors, touched, fieldName, t, isSubmitted);

  const checkForFieldValidity = (errs: FormikErrors<Application>): boolean => {
    const errorFieldKey = Object.keys(errs)[0];

    if (errorFieldKey) {
      focusAndScroll(errorFieldKey);
      return false;
    }

    if (isDeMinimisAidRowUnfinished()) {
      focusAndScroll('deMinimisAid');
      return false;
    }

    void formik.validateForm();
    return true;
  };

  const submitIfFormValid = (isFormValid: boolean): boolean => {
    void handleDeMinimisRadioButtonChange(fields);
    if (isFormValid) {
      void formik.submitForm();
      return true;
    }
    return false;
  };

  const handleSubmit = (): void => {
    setIsSubmitted(true);
    void formik
      .validateForm()
      .then((errs) => checkForFieldValidity(errs))
      .then((isFormValid: boolean) => submitIfFormValid(isFormValid));
  };

  const handleSave = (): void | boolean => {
    if (isDeMinimisAidRowUnfinished()) {
      return false;
    }
    return void handleDeMinimisRadioButtonChange(fields)
      .then(() => onSave(values))
      .catch(() => false);
  };

  const applicationId = values?.id;
  const handleDelete = applicationId
    ? () => {
        void onDelete(applicationId);
      }
    : undefined;

  const clearDeminimisAids = React.useCallback((): void => {
    setDeMinimisAids([]);
    void setFieldValue(fields.deMinimisAid.name, null);
  }, [fields.deMinimisAid.name, setDeMinimisAids, setFieldValue]);

  const showDeminimisSection = hasBusinessActivitiesOrIsCompany(
    values.associationHasBusinessActivities,
    organizationType
  );

  const languageOptions = React.useMemo(
    (): OptionType<string>[] => getLanguageOptions(t, 'languages'),
    [t]
  );

  const getDefaultSelectValue = (fieldName: keyof Application): OptionType =>
    languageOptions.find(
      (o) => o.value === String(application?.[fieldName])
    ) || {
      label: '',
      value: '',
    };

  return {
    t,
    fields,
    translationsBase,
    formik,
    showDeminimisSection,
    getErrorMessage,
    handleSubmit,
    handleSave,
    handleDelete,
    clearDeminimisAids,
    deMinimisAidSet: application.deMinimisAidSet || [],
    languageOptions,
    getDefaultSelectValue,
  };
};

export { useApplicationFormStep1 };
