// src/app/layout.tsx
import "../app/globals.css"; // Adjust path as needed
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
