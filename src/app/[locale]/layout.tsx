import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout";
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart"; // ✅ Import

export default function LocaleLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: { locale: string };
}) {
    return (
        <LocaleClientLayout locale={params.locale}>
            <LoadUserSettingsOnStart /> {/* ✅ Load settings when user enters */}
            {children}
        </LocaleClientLayout>
    );
}
