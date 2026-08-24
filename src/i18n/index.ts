import { defaultLocale, locales, type Locale } from './config';
import de from './de';

const dictionaries = { de };

export type Dictionary = typeof de;

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function useTranslations(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function localizePath(path: string, locale: Locale = defaultLocale): string {
  if (locale === defaultLocale) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export { defaultLocale, locales, type Locale };
export { htmlLang, localeLabel } from './config';
