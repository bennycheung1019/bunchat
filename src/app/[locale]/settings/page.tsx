"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // ✅ Correct
import { useTranslations } from "next-intl"; // ✅ For translations


export default function SettingsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [language, setLanguage] = useState<"en" | "zh-Hant" | "zh-Hans">("en");

    // Load from localStorage
    useEffect(() => {
        const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";
        const currentLocale = pathname.split("/")[1] as "en" | "zh-Hant" | "zh-Hans";

        setTheme(savedTheme);
        setLanguage(currentLocale);
        document.documentElement.className = savedTheme; // set <html> class
    }, [pathname]);

    // Change Theme
    const toggleTheme = (mode: "light" | "dark") => {
        setTheme(mode);
        localStorage.setItem("theme", mode);
        document.documentElement.className = mode; // update immediately
    };

    // Change Language
    const changeLanguage = (newLang: "en" | "zh-Hant" | "zh-Hans") => {
        const segments = pathname.split("/");
        segments[1] = newLang; // replace locale segment
        router.push(segments.join("/"));
    };

    return (
        <div className="max-w-2xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-semibold mb-8">Settings</h1>

            {/* Theme Section */}
            <div className="mb-8">
                <h2 className="text-lg font-medium mb-3">Theme</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => toggleTheme("light")}
                        className={`px-4 py-2 rounded-md border ${theme === "light" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                    >
                        Light
                    </button>
                    <button
                        onClick={() => toggleTheme("dark")}
                        className={`px-4 py-2 rounded-md border ${theme === "dark" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                    >
                        Dark
                    </button>
                </div>
            </div>

            {/* Language Section */}
            <div>
                <h2 className="text-lg font-medium mb-3">Language</h2>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => changeLanguage("en")}
                        className={`px-4 py-2 rounded-md border ${language === "en" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => changeLanguage("zh-Hant")}
                        className={`px-4 py-2 rounded-md border ${language === "zh-Hant" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                    >
                        繁體中文
                    </button>
                    <button
                        onClick={() => changeLanguage("zh-Hans")}
                        className={`px-4 py-2 rounded-md border ${language === "zh-Hans" ? "bg-blue-500 text-white" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                    >
                        简体中文
                    </button>
                </div>
            </div>
        </div>
    );
}
