// src/app/[locale]/SessionProviderWrapper.tsx
"use client"; // This component provides the client boundary

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

export function SessionProviderWrapper({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}