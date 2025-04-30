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
    improve: {
        button: string;
        loading: string;
        placeholder: string;
        placeholderOutput: string;
        error: string;
    };
    common: {
        copied: string;
        paste: string;
        clear: string;
    };
    translate: {
        button: {
            en: string;
            "zh-tw": string;
            "zh-cn": string;
        };
        placeholder: string;
        placeholderOutput: string;
        error: string;
    };
    reply: {
        placeholderEmail: string;
        placeholderSummary: string;
        placeholderOutput: string;
        generate: string;
        loading: string;
        error: string;
        paste: string;
        clear: string;
        copied: string;
        tone: {
            short: string;
            formal: string;
            friendly: string;
        };
    };
    chat: {
        thinking: string;
        noReply: string;
        error: string;
        clickToCopy: string;
        placeholder: string;
        send: string;
        scrollToBottom: string;
        copied: string;
    };
    sidebar: {
        navigation: string;
        work: string;
        imageTool: string;
    };
    topbar: {
        settings: string;
        logout: string;
    };
    imageTools: {
        backgroundRemoval: string;
        upscaling: string;
        ocr: string;
        generate: string;
    };

};

export default getRequestConfig(async ({ locale }) => {
    if (!locale || !locales.includes(locale as Locale)) {
        notFound();
    }

    const typedLocale = locale as Locale;

    const messages: Messages = (await import(`./messages/${typedLocale}.json`)).default;

    return {
        locale: typedLocale,
        messages
    };
});
