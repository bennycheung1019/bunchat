"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { loadUserSettingsFromFirestore } from "@/lib/loadUserSettingsFromFirestore";

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

            if (settings) {
                localStorage.setItem("theme", settings.theme);
                localStorage.setItem("preferredLanguage", settings.language);

                document.cookie = `preferredLanguage=${settings.language}; path=/; max-age=31536000`;
                document.documentElement.className = settings.theme;
            }
        }

        loadSettings();
    }, [session]);

    return null;
}
