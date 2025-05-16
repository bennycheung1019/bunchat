"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ToastOnTokenAdded() {
    const [showToast, setShowToast] = useState(false);
    const pathname = usePathname();
    const t = useTranslations("toast");

    useEffect(() => {
        const flag = localStorage.getItem("showTokenToast");
        const isRootPath = /^\/(en|zh-Hant|zh-Hans)$/.test(pathname);

        if (flag === "true" && isRootPath) {
            localStorage.removeItem("showTokenToast");
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 6000);
        }
    }, [pathname]);

    if (!showToast) return null;

    return (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
            <div className="bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 justify-center text-sm sm:text-base">
                <span>{t("tokensAdded")}</span>
            </div>
        </div>
    );

}
