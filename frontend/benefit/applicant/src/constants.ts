export const IS_CLIENT = typeof window !== 'undefined';

export enum ROUTES {
  HOME = '/',
  APPLICATION_NEW = '/application/new',
  APPLICATION_EDIT = '/application/edit',
}

export enum SUPPORTED_LANGUAGES {
  FI = 'fi',
  SV = 'sv',
  EN = 'en',
}

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.FI;

export const COMMON_I18N_NAMESPACES = ['common'];

export const PRIVACY_POLICY_LINKS = {
  fi: 'https://www.hel.fi/1',
  en: 'https://www.hel.fi/2',
  sv: 'https://www.hel.fi/3',
};

export enum APPLICATION_STATUSES {
  DRAFT = 'draft',
  INFO_REQUIRED = 'additional_information_needed',
  RECEIVED = 'received',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum BENEFIT_TYPES {
  EMPLOYMENT = 'employment_benefit',
  SALARY = 'salary_benefit',
  COMMISSION = 'commission_benefit',
}

export enum APPLICATION_FIELDS {
  // step1 - Company
  HAS_COMPANY_OTHER_ADDRESS = 'hasCompanyOtherAddress',
  COMPANY_OTHER_ADDRESS_STREET = 'companyOtherAddressStreet',
  COMPANY_OTHER_ADDRESS_ZIP = 'companyOtherAddressZipCode',
  COMPANY_OTHER_ADDRESS_DISTRICT = 'companyOtherAddressPostalDistrict',
  COMPANY_IBAN = 'companyIban',
  CONTACT_PERSON_FIRST_NAME = 'contactPersonFirstName',
  CONTACT_PERSON_LAST_NAME = 'contactPersonLastName',
  CONTACT_PERSON_PHONE = 'contactPersonPhone',
  CONTACT_PERSON_EMAIL = 'contactPersonEmail',
  DE_MINIMIS_AIDS_GRANTED = 'deMinimisAidGranted',
  COLLECTIVE_BARGAINING_ONGOING = 'collectiveBargainingOngoing',
  COLLECTIVE_BARGAINING_INFO = 'collectiveBargainingInfo',
  // step2 - Employee
  EMPLOYEE_FIRST_NAME = 'employeeFirstName',
  EMPLOYEE_LAST_NAME = 'employeeLastName',
  EMPLOYEE_SSN = 'employeeSsn',
  EMPLOYEE_PHONE = 'employeePhone',
  IS_HELSINKI_MUNICIPALITY = 'isHelsinkiMunicipality',
  PAY_SUBSIDY_GRANTED = 'paySubsidyGranted',
  PAY_SUBSIDY_PERCENT = 'paySubsidyPercent',
  PAY_SUBSIDY_ADDITIONAL_PERCENT = 'paySubsidyAdditionalPercent',
  APPRENTICESHIP_PROGRAM = 'apprenticeshipProgram',
  BENEFIT_TYPE = 'benefitType',
}

export enum DE_MINIMIS_AID_FIELDS {
  GRANTER = 'deMinimisAidGranter',
  AMOUNT = 'deMinimisAidAmount',
  ISSUE_DATE = 'deMinimisAidIssueDate',
}

export const DEFAULT_APPLICATION = {
  [APPLICATION_FIELDS.HAS_COMPANY_OTHER_ADDRESS]: false,
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_STREET]: '',
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_ZIP]: '',
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_DISTRICT]: '',
  [APPLICATION_FIELDS.COMPANY_IBAN]: '',
  [APPLICATION_FIELDS.CONTACT_PERSON_FIRST_NAME]: '',
  [APPLICATION_FIELDS.CONTACT_PERSON_LAST_NAME]: '',
  [APPLICATION_FIELDS.CONTACT_PERSON_PHONE]: '',
  [APPLICATION_FIELDS.CONTACT_PERSON_EMAIL]: '',
  [APPLICATION_FIELDS.DE_MINIMIS_AIDS_GRANTED]: false,
  deMinimisAidGrants: [],
  [APPLICATION_FIELDS.COLLECTIVE_BARGAINING_ONGOING]: '',
  [APPLICATION_FIELDS.COLLECTIVE_BARGAINING_INFO]: '',
};

export const PAY_SUBSIDY_OPTIONS = ['30', '40', '50', '100'];

export enum VALIDATION_MESSAGE_KEYS {
  REQUIRED = 'common:form.validation.required',
  EMAIL = 'common:form.validation.string.email',
  IBAN_INVALID = 'common:form.validation.iban.invalid',
  NUMBER_MIN = 'common:form.validation.number.min',
  NUMBER_MAX = 'common:form.validation.number.max',
  STRING_POSITIVENUMBER = 'common:form.validation.string.positiveNumber',
  STRING_MIN = 'common:form.validation.string.min',
  STRING_MAX = 'common:form.validation.string.max',
  URL = 'common:form.validation.string.url',
  DATE = 'common:form.validation.string.date',
  DATE_IN_THE_FUTURE = 'common:form.validation.date.mustNotInThePast',
  DATE_MIN = 'common:form.validation.date.min',
  DATE_MAX = 'common:form.validation.date.max',
  DATE_FORMAT = 'common:form.validation.date.format',
  TIME = 'common:form.validation.string.time',
  TIME_MIN = 'common:form.validation.time.min',
  TIME_MAX = 'common:form.validation.time.max',
}

export const dateRegex = /(?:(?:0?[1-9]|1\d|2\d)\.(?:0?[1-9]|1[0-2])|(?:30\.(?!02)(?:0[1-9]|1[0-2]))|(?:31\.(?:0[13578]|1[02])))\.(?:19|20)\d{2}/;
