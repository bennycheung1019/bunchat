import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout";
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart";

// ✅ Define our own layout prop type here
interface LocaleLayoutProps {
    children: ReactNode;
    params: { locale: string };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
    return (
        <html lang={params.locale}>
            <body>
                <LocaleClientLayout locale={params.locale}>
                    <LoadUserSettingsOnStart />
                    {children}
                </LocaleClientLayout>
            </body>
        </html>
    );
}
