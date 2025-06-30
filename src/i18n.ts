import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationUk from './locales/uk/translation.json';

void i18n.use(initReactI18next).init({
  resources: { uk: { translation: translationUk } },
  lng: 'uk',
  fallbackLng: 'uk',
  interpolation: { escapeValue: false },
});

export default i18n;
