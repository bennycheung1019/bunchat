// src/i18n.ts
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'zh-Hant', 'zh-Hans'] as const;
type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }): Promise<{ locale: Locale; messages: any }> => {
    if (!locale || !locales.includes(locale as Locale)) {
        notFound();
    }

    const typedLocale = locale as Locale;

    return {
        locale: typedLocale,
        messages: (await import(`./messages/${typedLocale}.json`)).default
    };
});
