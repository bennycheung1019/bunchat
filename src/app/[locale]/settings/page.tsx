"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { saveUserSettingsToFirestore } from "@/lib/saveUserSettingsToFirestore";

export default function SettingsPage() {
    const t = useTranslations();
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
    const [currentLanguage, setCurrentLanguage] = useState<"en" | "zh-Hant" | "zh-Hans">("en");

    // Load saved theme and language
    useEffect(() => {
        const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
        setCurrentTheme(savedTheme);
        document.documentElement.className = savedTheme;

        const localeFromPath = pathname.split("/")[1] as "en" | "zh-Hant" | "zh-Hans";
        setCurrentLanguage(localeFromPath);
    }, [pathname]);

    const handleThemeChange = async (selectedTheme: "light" | "dark") => {
        setCurrentTheme(selectedTheme);
        localStorage.setItem("theme", selectedTheme);
        document.documentElement.className = selectedTheme;

        if (!session || !session.user?.id) {
            console.warn("⚠️ Cannot save settings: session is null or user ID missing.");
            return;
        }

        await saveUserSettingsToFirestore(session.user.id, selectedTheme, currentLanguage);
    };

    const handleLanguageChange = async (selectedLanguage: "en" | "zh-Hant" | "zh-Hans") => {
        setCurrentLanguage(selectedLanguage);
        localStorage.setItem("preferredLanguage", selectedLanguage); // ✅ ensure updated
        document.cookie = `preferredLanguage=${selectedLanguage}; path=/; max-age=31536000`; // ✅ overwrite cookie
        localStorage.removeItem("manualLanguageSwitch"); // ✅ optional: prevent guest override from re-applying

        if (!session || !session.user?.id) {
            console.warn("⚠️ Cannot save settings: session is null or user ID missing.");
            return;
        }

        await saveUserSettingsToFirestore(session.user.id, currentTheme, selectedLanguage);

        // Navigate to correct locale page
        const segments = pathname.split("/");
        segments[1] = selectedLanguage;
        router.push(segments.join("/"));
    };


    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-zinc-900">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 flex items-center bg-white dark:bg-zinc-800 shadow-sm h-14 px-4">
                <button
                    onClick={() => {
                        const segments = pathname.split("/");
                        const currentLocale = segments[1] || "en";
                        router.push(`/${currentLocale}`);
                    }}
                    className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                >
                    <span className="text-xl">←</span>
                </button>
                <h1 className="text-lg font-semibold">{t("settings")}</h1>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-8">
                {/* Theme Section */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-md p-6 space-y-4">
                    <h2 className="text-lg font-semibold">{t("theme")}</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleThemeChange("light")}
                            className={`px-5 py-2 rounded-full font-medium transition border ${currentTheme === "light"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 dark:bg-zinc-700 dark:text-gray-200 border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                }`}
                        >
                            {t("light")}
                        </button>
                        <button
                            onClick={() => handleThemeChange("dark")}
                            className={`px-5 py-2 rounded-full font-medium transition border ${currentTheme === "dark"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 dark:bg-zinc-700 dark:text-gray-200 border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                }`}
                        >
                            {t("dark")}
                        </button>
                    </div>
                </div>

                {/* Language Section */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-md p-6 space-y-4">
                    <h2 className="text-lg font-semibold">{t("language")}</h2>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => handleLanguageChange("en")}
                            className={`px-5 py-2 rounded-full font-medium transition border ${currentLanguage === "en"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 dark:bg-zinc-700 dark:text-gray-200 border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                }`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => handleLanguageChange("zh-Hant")}
                            className={`px-5 py-2 rounded-full font-medium transition border ${currentLanguage === "zh-Hant"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 dark:bg-zinc-700 dark:text-gray-200 border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                }`}
                        >
                            繁體中文
                        </button>
                        <button
                            onClick={() => handleLanguageChange("zh-Hans")}
                            className={`px-5 py-2 rounded-full font-medium transition border ${currentLanguage === "zh-Hans"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 dark:bg-zinc-700 dark:text-gray-200 border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-600"
                                }`}
                        >
                            简体中文
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
