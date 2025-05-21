"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { saveUserSettingsToFirestore } from "@/lib/saveUserSettingsToFirestore";
import BillingHistory from "@/components/BillingHistory";

export default function SettingsPage() {
    const t = useTranslations();
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const locale = pathname.split("/")[1] || "en";

    const [currentLanguage, setCurrentLanguage] = useState<"en" | "zh-Hant" | "zh-Hans">("en");
    const [activeTab, setActiveTab] = useState<"general" | "billing">(
        searchParams.get("tab") === "billing" ? "billing" : "general"
    );

    useEffect(() => {
        const localeFromPath = pathname.split("/")[1] as "en" | "zh-Hant" | "zh-Hans";
        setCurrentLanguage(localeFromPath);
    }, [pathname]);

    const handleLanguageChange = async (selectedLanguage: "en" | "zh-Hant" | "zh-Hans") => {
        localStorage.setItem("preferredLanguage", selectedLanguage);
        document.cookie = `preferredLanguage=${selectedLanguage}; path=/; max-age=31536000`;
        localStorage.setItem("manualLanguageSwitch", "true");

        if (!session?.user?.id) {
            console.warn("⚠️ Cannot save settings: session is null or user ID missing.");
            return;
        }

        await saveUserSettingsToFirestore(session.user.id, "light", selectedLanguage);

        const segments = pathname.split("/");
        segments[1] = selectedLanguage;
        router.push(segments.join("/"));
    };

    const handleTabChange = (tab: "general" | "billing") => {
        setActiveTab(tab);
        const url = `${pathname}?tab=${tab}`;
        router.push(url);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 flex items-center bg-white shadow-sm h-14 px-4">
                <button
                    onClick={() => {
                        const raw = localStorage.getItem("previousView");
                        if (!raw) {
                            router.push(`/${locale}`);
                            return;
                        }

                        try {
                            const parsed = JSON.parse(raw);
                            if (parsed?.path && typeof parsed.path === "string") {
                                router.push(parsed.path);
                            } else {
                                router.push(`/${locale}`);
                            }
                        } catch (err) {
                            console.error("❌ Failed to parse previousView:", err);
                            router.push(`/${locale}`);
                        }
                    }}
                    className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                >
                    <span className="text-xl">←</span>
                </button>
                <h1 className="text-lg font-semibold">{t("settings.settings")}</h1>
            </div>

            {/* Tabs */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-8 pt-4 pb-2">
                <div className="flex justify-center gap-4 max-w-2xl mx-auto">
                    {[
                        { key: "general", label: t("settings.general") },
                        { key: "billing", label: t("settings.billing") },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleTabChange(key as "general" | "billing")}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2
          ${activeTab === key
                                    ? "bg-[var(--primary-color)] text-white shadow border border-[var(--primary-color)] -mb-px z-10"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>



            {/* Tab Content */}
            <div className="flex-1 px-4 sm:px-8 mt-4 py-6 max-w-2xl mx-auto w-full space-y-8">

                {activeTab === "general" && (
                    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                        <h2 className="text-lg font-semibold">{t("language")}</h2>
                        <div className="flex gap-4 flex-nowrap">
                            {["en", "zh-Hant", "zh-Hans"].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang as "en" | "zh-Hant" | "zh-Hans")}
                                    className={`px-5 py-2 rounded-full font-medium transition border 
              ${currentLanguage === lang
                                            ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                        }`}
                                >
                                    {{
                                        en: "English",
                                        "zh-Hant": "繁體中文",
                                        "zh-Hans": "简体中文",
                                    }[lang]}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "billing" && (
                    <div className="bg-white rounded-2xl shadow-md p-6">
                        <BillingHistory />
                    </div>
                )}
            </div>

        </div>
    );
}
