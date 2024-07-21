import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './langs/en.json';
import fr from './langs/fr.json';

i18n.use(initReactI18next).init({
    lng: 'fr',
    debug: false,
    resources: { en: { translation: en }, fr: { translation: fr } },
});
export default i18n;
