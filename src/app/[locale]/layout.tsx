// app/[locale]/layout.tsx
import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout";
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart";
import { TokenProvider } from "@/context/TokenContext";

export default async function LocaleLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <LocaleClientLayout locale={locale}>
            <TokenProvider>
                <LoadUserSettingsOnStart />
                {children}
            </TokenProvider>
        </LocaleClientLayout>
    );
}
