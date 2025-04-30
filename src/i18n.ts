// src/i18n.ts
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'zh-Hant', 'zh-Hans'] as const;
type Locale = (typeof locales)[number];
type Messages = {
    settings: string;
    logout: string;
    theme: string;
    language: string;
    light: string;
    dark: string;
    account: string;
    save: string;
    cancel: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    signInButton: string;
    modeChat: string;
    modeImprove: string;
    modeTranslate: string;
    modeReply: string;
    // New i18n keys for ImproveWriting.tsx
    "improve.button": string;
    "improve.loading": string;
    "improvePlaceholder": string;
    "improve.placeholderOutput": string;
    "improve.error": string;

    // Shared keys
    "common.copied": string;
    "common.paste": string;
    "common.clear": string;
};


export default getRequestConfig(async ({ locale }) => {
    if (!locale || !locales.includes(locale as Locale)) {
        notFound();
    }

    const typedLocale = locale as Locale;

    const messages: Messages = (await import(`./messages/${typedLocale}.json`)).default;

    return {
        locale: typedLocale,
        messages,
    };
});
