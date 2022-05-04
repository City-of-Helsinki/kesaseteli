import TranslatedComponent from '@frontend/shared/browser-tests/page-models/TranslatedComponent';
import { TranslationsApi } from '@frontend/shared/src/__tests__/types/translations';
import {
  containsRegexp,
  replaceValues,
} from '@frontend/shared/src/__tests__/utils/translation-utils';

import en from '../../public/locales/en/common.json';
import fi from '../../public/locales/fi/common.json';
import sv from '../../public/locales/sv/common.json';
import ApplicantTranslations from '../../test/i18n/applicant-translations';

abstract class ApplicantPageComponent extends TranslatedComponent<ApplicantTranslations> {
  // eslint-disable-next-line class-methods-use-this
  getTranslationsApi(): TranslationsApi<ApplicantTranslations> {
    return {
      translations: {
        fi,
        sv,
        en,
      },
      replaced: replaceValues,
      regexp: containsRegexp,
    };
  }
}
export default ApplicantPageComponent;
