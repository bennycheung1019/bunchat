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

    const [currentLanguage, setCurrentLanguage] = useState<"en" | "zh-Hant" | "zh-Hans">("en");

    useEffect(() => {
        const localeFromPath = pathname.split("/")[1] as "en" | "zh-Hant" | "zh-Hans";
        setCurrentLanguage(localeFromPath);
    }, [pathname]);

    const handleLanguageChange = async (selectedLanguage: "en" | "zh-Hant" | "zh-Hans") => {
        setCurrentLanguage(selectedLanguage);
        localStorage.setItem("preferredLanguage", selectedLanguage);
        document.cookie = `preferredLanguage=${selectedLanguage}; path=/; max-age=31536000`;
        localStorage.removeItem("manualLanguageSwitch");

        if (!session?.user?.id) {
            console.warn("⚠️ Cannot save settings: session is null or user ID missing.");
            return;
        }

        await saveUserSettingsToFirestore(session.user.id, "light", selectedLanguage);

        const segments = pathname.split("/");
        segments[1] = selectedLanguage;
        router.push(segments.join("/"));
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 flex items-center bg-white shadow-sm h-14 px-4">
                <button
                    onClick={() => {
                        const segments = pathname.split("/");
                        const currentLocale = segments[1] || "en";
                        router.push(`/${currentLocale}`);
                    }}
                    className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
                >
                    <span className="text-xl">←</span>
                </button>
                <h1 className="text-lg font-semibold">{t("settings")}</h1>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-8">
                {/* Language Section */}
                <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                    <h2 className="text-lg font-semibold">{t("language")}</h2>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => handleLanguageChange("en")}
                            className={`px-5 py-2 rounded-full font-medium transition border ${currentLanguage === "en"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => handleLanguageChange("zh-Hant")}
                            className={`px-5 py-2 rounded-full font-medium transition border ${currentLanguage === "zh-Hant"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            繁體中文
                        </button>
                        <button
                            onClick={() => handleLanguageChange("zh-Hans")}
                            className={`px-5 py-2 rounded-full font-medium transition border ${currentLanguage === "zh-Hans"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
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
