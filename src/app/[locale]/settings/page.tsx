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
    const locale = pathname.split("/")[1] || "en";

    const [currentLanguage, setCurrentLanguage] = useState<"en" | "zh-Hant" | "zh-Hans">("en");

    useEffect(() => {
        const localeFromPath = pathname.split("/")[1] as "en" | "zh-Hant" | "zh-Hans";
        setCurrentLanguage(localeFromPath);
    }, [pathname]);

    const handleLanguageChange = async (selectedLanguage: "en" | "zh-Hant" | "zh-Hans") => {
        // ✅ Fix 1: Set flag before redirecting
        localStorage.setItem("preferredLanguage", selectedLanguage);
        document.cookie = `preferredLanguage=${selectedLanguage}; path=/; max-age=31536000`;
        localStorage.setItem("manualLanguageSwitch", "true"); // 🟢 important line

        if (!session?.user?.id) {
            console.warn("⚠️ Cannot save settings: session is null or user ID missing.");
            return;
        }

        await saveUserSettingsToFirestore(session.user.id, "light", selectedLanguage);

        // Redirect to selected locale
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


                <h1 className="text-lg font-semibold">{t("settings")}</h1>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-8">
                {/* Language Section */}
                <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                    <h2 className="text-lg font-semibold">{t("language")}</h2>
                    <div className="flex gap-4 flex-nowrap">
                        <button
                            onClick={() => handleLanguageChange("en")}
                            className={`px-5 py-2 rounded-full font-medium transition border ${currentLanguage === "en"
                                ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => handleLanguageChange("zh-Hant")}
                            className={`px-5 py-2 rounded-full font-medium transition border ${currentLanguage === "zh-Hant"
                                ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            繁體中文
                        </button>
                        <button
                            onClick={() => handleLanguageChange("zh-Hans")}
                            className={`px-5 py-2 rounded-full font-medium transition border ${currentLanguage === "zh-Hans"
                                ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
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
