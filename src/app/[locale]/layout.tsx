// app/[locale]/layout.tsx
import { ReactNode } from "react";
import LocaleClientLayout from "@/components/LocaleClientLayout"; // Assuming this provides context/wrappers needed for the locale
import { LoadUserSettingsOnStart } from "@/components/LoadUserSettingsOnStart";

// This is a NESTED layout - it should NOT have <html> or <body>
export default function LocaleLayout({ // Renamed slightly for clarity, but 'Layout' is fine too
    children,
    params,
}: {
    children: ReactNode;
    params: { locale: string }; // Standard typing for params in a nested dynamic route
}) {
    // NO <html> or <body> tags here!
    return (
        // Pass locale to your client layout if it needs it (e.g., for next-intl provider)
        <LocaleClientLayout locale={params.locale}>
            <LoadUserSettingsOnStart />
            {children}
        </LocaleClientLayout>
    );
}