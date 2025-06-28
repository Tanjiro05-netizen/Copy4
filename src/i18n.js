// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import krTranslation from './locales/kr/translation.json';

// Create this file directly in the src folder
i18n
    .use(initReactI18next)
    .init({
        debug: true,  // Helps during development
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: enTranslation
            },
            kr: {
                translation: krTranslation
            }
        }
    });

export default i18n;