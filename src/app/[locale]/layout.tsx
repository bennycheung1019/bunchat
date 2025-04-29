import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout";
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart";

// Define a specific type for the props
interface RootLayoutProps {
    children: ReactNode;
    params: {
        locale: string; // Explicitly state that 'locale' is expected and is a string
        // Add other expected params here if this layout were nested deeper
    };
}

// Use the specific type
export default function Layout({ children, params }: RootLayoutProps) {
    return (
        // Use params.locale which is now guaranteed to exist by the type
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