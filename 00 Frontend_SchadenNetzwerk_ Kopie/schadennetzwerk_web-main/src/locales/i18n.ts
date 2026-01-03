import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { localStorageGetItem } from 'src/utils/storage-available';

import { defaultLang } from './config-lang';
import translationEn from './langs/en.json';
import translationDe from './langs/de.json';
import translationUA from './langs/ua.json';
import translationES from './langs/es.json';
import translationIT from './langs/it.json';
import translationTR from './langs/tr.json';
import translationFR from './langs/fr.json';
import translationRU from './langs/ru.json';
import translationEL from './langs/gr.json';
import translationPL from './langs/pl.json';

// ----------------------------------------------------------------------

const lng = localStorageGetItem('i18nextLng', defaultLang.value);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translations: translationEn },
      de: { translations: translationDe },
      ua: { translations: translationUA },
      es: { translations: translationES },
      it: { translations: translationIT },
      tr: { translations: translationTR },
      fr: { translations: translationFR },
      ru: { translations: translationRU },
      pl: { translations: translationPL },
      el: { translations: translationEL },
    },
    lng,
    fallbackLng: lng,
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
