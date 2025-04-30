"use client";

import { ReactNode, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { IntlProvider } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

import en from "@/messages/en.json";
import zhHant from "@/messages/zh-Hant.json";
import zhHans from "@/messages/zh-Hans.json";

import { loadUserSettingsFromFirestore } from "@/lib/loadUserSettingsFromFirestore";

const messagesMap = {
    en,
    "zh-Hant": zhHant,
    "zh-Hans": zhHans,
};

function LanguageSync({ locale }: { locale: string }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        async function syncUserLanguage() {
            if (!session?.user?.id) return;

            const settings = await loadUserSettingsFromFirestore(session.user.id);
            if (!settings) return;

            // Save to localStorage & cookie
            localStorage.setItem("theme", settings.theme);
            localStorage.setItem("preferredLanguage", settings.language);
            document.cookie = `preferredLanguage=${settings.language}; path=/; max-age=31536000`;

            // Apply theme
            document.documentElement.className = settings.theme;

            // Redirect to correct locale if needed
            const currentPathLocale = pathname.split("/")[1];
            if (currentPathLocale !== settings.language) {
                const newPath = pathname.replace(`/${currentPathLocale}`, `/${settings.language}`);
                router.replace(newPath);
            }
        }

        syncUserLanguage();
    }, [session, pathname, router, locale]);

    return null;
}

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
                <LanguageSync locale={locale} />
                {children}
            </IntlProvider>
        </SessionProvider>
    );
}
