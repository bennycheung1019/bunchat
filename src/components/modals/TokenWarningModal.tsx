"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function TokenWarningModal({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const t = useTranslations("tokenModal");
    console.log("Toast flag:", localStorage.getItem("showTokenToast"));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-80 text-center shadow-xl border border-gray-200">
                <div className="mb-3 text-3xl" style={{ color: "var(--primary-color)" }}>💎</div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--primary-color)" }}>
                    {t("title")}
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    {t("description")}
                </p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 transition"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={() => router.push("/purchase-tokens")}
                        className="px-4 py-2 rounded-md text-white font-medium shadow-sm"
                        style={{ backgroundColor: "rgba(6, 95, 70, 1)" }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#065f46")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(6, 95, 70, 1)")}
                    >
                        {t("buy")}
                    </button>
                </div>
            </div>
        </div>
    );
}
