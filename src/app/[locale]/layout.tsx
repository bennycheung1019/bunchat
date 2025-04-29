import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout";
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart";

// Correct props typing for App Router Layout
export interface LayoutProps {
    children: ReactNode;
    params: {
        locale: string;
    };
}

export default function LocaleLayout({ children, params }: LayoutProps) {
    return (
        <LocaleClientLayout locale={params.locale}>
            <LoadUserSettingsOnStart />
            {children}
        </LocaleClientLayout>
    );
}
