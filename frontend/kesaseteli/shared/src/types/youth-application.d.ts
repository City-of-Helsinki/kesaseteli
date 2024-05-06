import { Language } from '@frontend/shared/src/i18n/i18n';

type YouthApplication = {
  first_name: string;
  last_name: string;
  social_security_number: string;
  non_vtj_birthdate?: Date;
  non_vtj_home_municipality?: string;
  postcode: string;
  school?: string;
  is_unlisted_school: boolean;
  phone_number: string;
  email: string;
  language: Language;
  request_additional_information?: boolean;
};

export default YouthApplication;
