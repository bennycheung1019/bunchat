// src/app/layout.tsx
import "../app/globals.css"; // Adjust path as needed
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta name="color-scheme" content="light" />
                <meta name="format-detection" content="telephone=no, email=no" />
            </head>
            <body>{children}</body>
        </html>
    );
}
