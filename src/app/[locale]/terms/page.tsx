"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function TermsPage() {
    const t = useTranslations("termsPage");
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "en";

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="sticky top-0 z-20 flex items-center bg-white shadow-sm h-14 px-4">
                <button
                    onClick={() => router.back()}
                    className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
                >
                    <span className="text-xl">←</span>
                </button>
                <h1 className="text-lg font-semibold">{t("title")}</h1>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6 text-gray-700">
                <section>
                    <h2 className="text-xl font-bold">{t("section.terms")}</h2>
                    <p className="mt-2">{t("termsText")}</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold">{t("section.privacy")}</h2>
                    <p className="mt-2">{t("privacyText")}</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold">{t("section.tokens")}</h2>
                    <p className="mt-2">{t("tokenText")}</p>
                </section>
            </div>
        </div>
    );
}
