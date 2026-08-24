export const locales = ['de'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';

export const htmlLang: Record<Locale, string> = {
  de: 'de-CH',
};

export const localeLabel: Record<Locale, string> = {
  de: 'Deutsch',
};
