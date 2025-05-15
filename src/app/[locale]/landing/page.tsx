"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LandingPage() {
    const t = useTranslations("landing");
    const router = useRouter();
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || "en";

    return (
        <div className="min-h-screen bg-[#e4f8f6] text-[#064e3b]">
            {/* Header */}
            <header className="w-full border-b bg-white sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/minimindLogo-noText.png" alt="MiniMind Logo" className="h-9 w-auto" />
                        <span className="text-xl font-semibold text-[#064e3b]">minimind</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={locale}
                            onChange={async (e) => {
                                const selectedLang = e.target.value;
                                console.log("🔁 Language selected:", selectedLang); // ✅ client-side debug

                                localStorage.setItem("preferredLanguage1", selectedLang);
                                localStorage.setItem("manualLanguageSwitch", "true");
                                document.cookie = `preferredLanguage1=${selectedLang}; path=/; max-age=31536000`;

                                // ✅ Try updating Firestore
                                try {
                                    const res = await fetch("/api/save-language", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        credentials: "include", // ✅ This ensures cookies are sent!
                                        body: JSON.stringify({ language: selectedLang }),
                                    });

                                    const data = await res.json();
                                    console.log("🧾 API save-language response:", data); // ✅ client-side debug
                                } catch (err) {
                                    console.error("❌ Failed to update language in Firestore", err);
                                }

                                router.push(`/${selectedLang}/landing`);
                            }}



                        >

                            <option value="en">English</option>
                            <option value="zh-Hant">繁體中文</option>
                            <option value="zh-Hans">简体中文</option>
                        </select>
                        <a
                            href={`/${locale}`}
                            className="px-4 py-2 rounded-md bg-[#065f46] text-white text-sm font-medium hover:bg-[#047857] transition"
                        >
                            {t("launchApp")}
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-6 py-24 text-center bg-gradient-to-br from-[#e4f8f6] to-white">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6">{t("title")}</h1>
                    <p className="text-lg text-[#065f46] mb-8">{t("subtitle")}</p>
                    <a
                        href={`/${locale}/app`}
                        className="inline-block px-8 py-3 bg-[#065f46] text-white text-lg font-semibold rounded hover:bg-[#047857] transition"
                    >
                        {t("cta")}
                    </a>
                </div>
            </section>

            {/* Features */}
            <section className="bg-white py-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-10">{t("featuresTitle")}</h2>
                    <div className="grid md:grid-cols-3 gap-10 text-left">
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">💬 {t("feature1Title")}</h3>
                            <p className="text-gray-600">{t("feature1Desc")}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">✍️ {t("feature2Title")}</h3>
                            <p className="text-gray-600">{t("feature2Desc")}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">🌐 {t("feature3Title")}</h3>
                            <p className="text-gray-600">{t("feature3Desc")}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">📧 {t("feature4Title")}</h3>
                            <p className="text-gray-600">{t("feature4Desc")}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">🖼️ {t("feature5Title")}</h3>
                            <p className="text-gray-600">{t("feature5Desc")}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">🔧 {t("feature6Title")}</h3>
                            <p className="text-gray-600">{t("feature6Desc")}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-[#e4f8f6] text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4">{t("callToAction")}</h2>
                    <p className="text-[#065f46] mb-8">{t("callToActionDesc")}</p>
                    <a
                        href={`/${locale}/app`}
                        className="px-6 py-3 rounded-md bg-[#065f46] text-white font-medium text-lg hover:bg-[#047857] transition"
                    >
                        {t("launchNow")}
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-6 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} minimind.ai — Made with ❤️ for productivity
            </footer>
        </div>
    );
}
