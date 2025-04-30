// src/i18n.ts
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'zh-Hant', 'zh-Hans'];

export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale as any)) {
        notFound(); // This throws and stops execution if locale is invalid
    }

    // If execution reaches here, locale must be a valid string.
    // Assert the type to satisfy TypeScript.
    return {
        locale: locale as string, // <-- Add 'as string' assertion here
        messages: (await import(`./messages/${locale}.json`)).default // Use ./messages instead of ../messages
    };
});