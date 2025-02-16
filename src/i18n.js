// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
                translation: require('./locales/en/translation.json')
            },
            kr: {
                translation: require('./locales/kr/translation.json')
            }
        }
    });

export default i18n;