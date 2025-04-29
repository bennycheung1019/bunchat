// src/lib/saveUserSettingsToFirestore.ts

import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function saveUserSettingsToFirestore(
    userId: string,
    theme: "light" | "dark",
    language: "en" | "zh-Hant" | "zh-Hans"
) {
    if (!userId) {
        console.warn("⚠️ No userId provided. Cannot save settings.");
        return;
    }

    try {
        const userSettingsRef = doc(db, "users", userId, "settings", "preferences");

        await setDoc(
            userSettingsRef,
            {
                theme,
                language,
                updatedAt: new Date(),
            },
            { merge: true }
        );

        console.log("✅ Saved user settings to Firestore.");
    } catch (error) {
        console.error("❌ Failed to save user settings:", error);
    }
}
