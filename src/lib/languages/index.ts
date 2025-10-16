import { en } from './en';
import { sw } from './sw';

export type Language = 'en' | 'sw';
export type TranslationKey = keyof typeof en;

export const translations = {
  en,
  sw
} as const;

export function getTranslation(key: TranslationKey, language: Language = 'en'): string {
  return translations[language][key] || translations.en[key] || key;
}

export function interpolate(text: string, values: Record<string, string>): string {
  return text.replace(/{(\w+)}/g, (match, key) => values[key] || match);
}