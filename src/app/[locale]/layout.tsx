// app/[locale]/layout.tsx
import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout";
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart";

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
            <LoadUserSettingsOnStart />
            {children}
        </LocaleClientLayout>
    );
}
