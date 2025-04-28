"use client";

import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { IntlProvider } from "next-intl";
import "../globals.css";

import en from "../../messages/en.json";
import zhHant from "../../messages/zh-Hant.json";
import zhHans from "../../messages/zh-Hans.json";

const messagesMap = {
    "en": en,
    "zh-Hant": zhHant,
    "zh-Hans": zhHans,
};

export default function LocaleLayout({
    children,
    params: { locale },
}: {
    children: ReactNode;
    params: { locale: string };
}) {
    const messages = messagesMap[locale as keyof typeof messagesMap];

    if (!messages) {
        notFound();
    }

    return (
        <html lang={locale}>
            <head />
            <body>
                <SessionProvider>
                    <IntlProvider locale={locale} messages={messages}>
                        {children}
                    </IntlProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
