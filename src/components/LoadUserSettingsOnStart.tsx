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
                // Apply theme from Firestore
                //localStorage.setItem("theme", settings.theme);
                //document.documentElement.className = settings.theme;

                // Always use Firestore language when logged in
                localStorage.setItem("preferredLanguage", settings.language);
                document.cookie = `preferredLanguage=${settings.language}; path=/; max-age=31536000`;
            } else {
                // New user — use guest preference to create initial settings
                await saveUserSettingsToFirestore(
                    session.user.id,
                    storedTheme as "light" | "dark",
                    storedLanguage as "en" | "zh-Hant" | "zh-Hans"
                );
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
