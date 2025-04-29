// src/lib/loadUserSettingsFromFirestore.ts

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function loadUserSettingsFromFirestore(userId: string) {
    if (!userId) {
        console.warn("⚠️ No userId provided. Cannot load settings.");
        return null;
    }

    try {
        const ref = doc(db, "users", userId, "settings", "preferences");
        const docSnap = await getDoc(ref);

        if (docSnap.exists()) {
            console.log("✅ User settings found:", docSnap.data());
            return docSnap.data() as {
                theme: "light" | "dark";
                language: "en" | "zh-Hant" | "zh-Hans";
            };
        } else {
            console.warn("⚠️ No user settings document found.");
            return null;
        }
    } catch (error) {
        console.error("❌ Failed to load user settings:", error);
        return null;
    }
}
