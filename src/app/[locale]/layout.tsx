import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout";
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart";

interface LayoutProps {
    children: ReactNode;
    params: { locale: string };
}

// ✅ `async` function required because App Router treats params as Promise
export default async function LocaleLayout({ children, params }: LayoutProps) {
    return (
        <LocaleClientLayout locale={params.locale}>
            <LoadUserSettingsOnStart />
            {children}
        </LocaleClientLayout>
    );
}
