"use client";

import { ReactNode, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { IntlProvider } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

import en from "@/messages/en.json";
import zhHant from "@/messages/zh-Hant.json";
import zhHans from "@/messages/zh-Hans.json";

import { loadUserSettingsFromFirestore } from "@/lib/loadUserSettingsFromFirestore";
import ToastOnTokenAdded from "@/components/modals/ToastOnTokenAdded";

const messagesMap = {
    en,
    "zh-Hant": zhHant,
    "zh-Hans": zhHans,
};

function LanguageSync({ locale }: { locale: string }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const locales = ["en", "zh-Hant", "zh-Hans"];
    const currentPathLocale = pathname.split("/")[1];

    useEffect(() => {
        async function syncUserLanguage() {
            if (session?.user?.id) {
                const settings = await loadUserSettingsFromFirestore(session.user.id);
                if (!settings) return;

                localStorage.setItem("theme", settings.theme);
                localStorage.setItem("preferredLanguage", settings.language);
                document.cookie = `preferredLanguage=${settings.language}; path=/; max-age=31536000`;
                document.documentElement.className = settings.theme;

                localStorage.removeItem("manualLanguageSwitch");

                if (
                    currentPathLocale !== settings.language &&
                    locales.includes(settings.language)
                ) {
                    const newPath = pathname.replace(
                        `/${currentPathLocale}`,
                        `/${settings.language}`
                    );
                    if (newPath !== pathname) {
                        router.replace(newPath);
                    }
                }

                return;
            }

            const preferred =
                localStorage.getItem("preferredLanguage") ||
                getCookie("preferredLanguage") ||
                "en";

            const manuallyChosen =
                localStorage.getItem("manualLanguageSwitch") === "true";

            if (
                !manuallyChosen &&
                currentPathLocale !== preferred &&
                locales.includes(preferred)
            ) {
                const newPath = pathname.replace(
                    `/${currentPathLocale}`,
                    `/${preferred}`
                );
                if (newPath !== pathname) {
                    router.replace(newPath);
                }
            }
        }

        syncUserLanguage();
    }, [session, pathname, router, locale]);

    return null;
}

function getCookie(name: string) {
    const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : null;
}

export default function LocaleClientLayout({
    children,
    locale,
}: {
    children: ReactNode;
    locale: string;
}) {
    const messages =
        messagesMap[locale as keyof typeof messagesMap] || messagesMap.en;

    return (
        <SessionProvider>
            <IntlProvider locale={locale} messages={messages}>
                <LanguageSync locale={locale} />
                <ToastOnTokenAdded />
                {children}
            </IntlProvider>
        </SessionProvider>
    );
}
