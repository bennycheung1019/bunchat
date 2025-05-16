"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function PurchaseSuccess() {
    const t = useTranslations("success");
    const [message, setMessage] = useState(t("processing"));
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "en"; // fallback locale

    useEffect(() => {
        const timeout = setTimeout(() => {
            setMessage(t("confirmed"));
        }, 1500);

        return () => clearTimeout(timeout);
    }, [t]);

    return (
        <div className="max-w-md mx-auto py-20 px-6 text-center space-y-6">
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-gray-700 text-lg">{message}</p>

            {message === t("confirmed") && (
                <button
                    onClick={() => router.push(`/${locale}`)}

                    className="w-full py-3 text-white font-semibold text-lg rounded-lg bg-blue-600 hover:bg-blue-700 transition duration-150"
                >
                    {t("back")}
                </button>
            )}
        </div>
    );
}
