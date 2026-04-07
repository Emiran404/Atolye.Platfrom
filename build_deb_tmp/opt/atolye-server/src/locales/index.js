import { tr } from './tr';
import { en } from './en';

export const getTranslation = (key, lang = 'tr') => {
  const translations = lang === 'en' ? en : tr;
  return translations[key] || key;
};

export const getCurrentLanguage = () => {
  return localStorage.getItem('language') || 'tr';
};

export { tr, en };
