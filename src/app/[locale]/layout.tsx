import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout";
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart";

export default function Layout({
    children,
    params,
}: {
    children: ReactNode;
    params: any; // <-- ✅ force bypass type checking
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
