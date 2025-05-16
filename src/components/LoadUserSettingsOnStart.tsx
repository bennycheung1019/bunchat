"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { loadUserSettingsFromFirestore } from "@/lib/loadUserSettingsFromFirestore";
import { saveUserSettingsToFirestore } from "@/lib/saveUserSettingsToFirestore";

export function LoadUserSettingsOnStart() {
    const { data: session } = useSession();

    useEffect(() => {
        async function loadSettings() {
            if (!session?.user?.id) {
                console.warn("⚠️ No session.user.id found. Cannot load user settings.");
                return;
            }

            console.log("🔵 Loading settings for user:", session.user.id);

            const settings = await loadUserSettingsFromFirestore(session.user.id);
            console.log("🔵 Loaded settings:", settings);

            const storedTheme = localStorage.getItem("theme") || "light";
            const storedLanguage =
                localStorage.getItem("preferredLanguage1") ||
                getCookie("preferredLanguage1") ||
                "en";
            console.log("preferredLanguage1", storedLanguage);

            if (settings) {
                console.log("inside settings");

                console.log("oldLanguage", settings.language);

                // ✅ Sync theme from Firestore to DOM and storage
                localStorage.setItem("theme", settings.theme);
                document.documentElement.className = "light";  //ALWAYS LIGHT MODE NOW!!!

                if (storedLanguage !== settings.language) {
                    console.log("📝 Overwriting Firestore with guest language:", storedLanguage);

                    // ✅ Firestore is outdated — update it with guest choice
                    await saveUserSettingsToFirestore(
                        session.user.id,
                        settings.theme,
                        storedLanguage as "en" | "zh-Hant" | "zh-Hans"
                    );

                    // ✅ Also update localStorage and cookie with guest language
                    localStorage.setItem("preferredLanguage", storedLanguage);
                    document.cookie = `preferredLanguage=${storedLanguage}; path=/; max-age=31536000`;
                } else {
                    // ✅ Everything matches — apply as normal
                    localStorage.setItem("preferredLanguage", settings.language);
                    document.cookie = `preferredLanguage=${settings.language}; path=/; max-age=31536000`;
                }
            } else {
                // ✅ If no settings yet (new user), use guest language/theme
                await saveUserSettingsToFirestore(
                    session.user.id,
                    storedTheme as "light" | "dark",
                    storedLanguage as "en" | "zh-Hant" | "zh-Hans"
                );
                console.log("✅ Saved initial guest settings to Firestore.");
            }
        }

        loadSettings();
    }, [session]);

    return null;
}

function getCookie(name: string) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
}
