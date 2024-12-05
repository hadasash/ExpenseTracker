// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from "../assets/translations.json"; 


i18n
  .use(initReactI18next) // הוספת התמיכה ב-React
  .init({
    resources: {
      he: {
        translation: translations.he, // תרגומים לעברית
      },
      en: {
        translation: translations.en, // תרגומים לאנגלית
      },
      es: {
        translation: translations.es, // תרגומים ספרדית
      },
    },
    lng: 'he', // ברירת המחדל היא 'he'
    fallbackLng: 'he', // אם אין תרגום בשפה הנבחרת, תשתמש ב- 'he'
    interpolation: {
      escapeValue: false, // React כבר מטפל בהימנע מ-XSS
    },
  });

export default i18n;
