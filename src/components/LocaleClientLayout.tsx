"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { IntlProvider } from "next-intl";

import en from "@/messages/en.json";
import zhHant from "@/messages/zh-Hant.json";
import zhHans from "@/messages/zh-Hans.json";

const messagesMap = {
    en,
    "zh-Hant": zhHant,
    "zh-Hans": zhHans,
};

export default function LocaleClientLayout({
    children,
    locale,
}: {
    children: ReactNode;
    locale: string;
}) {
    const messages = messagesMap[locale as keyof typeof messagesMap] || messagesMap.en;

    return (
        <SessionProvider>
            <IntlProvider locale={locale} messages={messages}>
                {children}
            </IntlProvider>
        </SessionProvider>
    );
}
