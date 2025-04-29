import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout";
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart";

// Use an inline type definition for the props
export default function Layout({
    children,
    params,
}: {
    children: ReactNode;
    params: { locale: string }; // Specify only the known 'locale' parameter as string
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