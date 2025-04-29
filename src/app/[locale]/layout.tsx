import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout";
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart";

export default function LocaleLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: { locale: string };
}) {
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
