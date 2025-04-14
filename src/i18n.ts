import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'de'] as const;
export type Locale = (typeof locales)[number];

// This is the default locale used when a translation is missing
export const defaultLocale = 'en' as const;

// This is used to configure the Next.js app with the locales
export default getRequestConfig(async ({ locale }) => {
  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
