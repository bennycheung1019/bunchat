// src/components/ThemeHydrationWrapper.tsx
"use client";

import { useEffect } from "react";

export function ThemeHydrationWrapper() {
    useEffect(() => {
        const theme = localStorage.getItem("theme") || "light";
        document.documentElement.className = theme;
    }, []);

    return null;
}
