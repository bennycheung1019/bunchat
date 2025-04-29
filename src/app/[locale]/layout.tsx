import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout";
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart";

type LocaleLayoutProps = {
    children: ReactNode;
    params: { locale: string };
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    return (
        <LocaleClientLayout locale={params.locale}>
            <LoadUserSettingsOnStart />
            {children}
        </LocaleClientLayout>
    );
}
