"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function HelpPage() {
    const t = useTranslations("helpPage");
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
            <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-8">
                <section>
                    <h2 className="text-xl font-bold mb-2">{t("section.general")}</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-gray-800">{t("q1.title")}</h3>
                            <p className="text-gray-600">{t("q1.answer")}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800">{t("q2.title")}</h3>
                            <p className="text-gray-600">{t("q2.answer")}</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-2">{t("section.billing")}</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-gray-800">{t("q3.title")}</h3>
                            <p className="text-gray-600">{t("q3.answer")}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
