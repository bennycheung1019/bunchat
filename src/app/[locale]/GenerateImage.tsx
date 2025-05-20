"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useTokenContext } from "@/context/TokenContext";
import { deductTokens } from "@/lib/tokenUtils";
import DiamondIcon from "@/components/icons/DiamondIcon";
import Image from "next/image";

export default function GenerateImage() {
    const t = useTranslations("create");
    const { data: session } = useSession();
    const { refreshTokenBalance } = useTokenContext();

    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showCopied, setShowCopied] = useState(false);

    const handleGenerate = async () => {
        if (!session?.user?.id) {
            alert("Please sign in again.");
            return;
        }

        if (!prompt.trim()) return;

        setLoading(true);
        setProgress(10);
        setImageUrl(null);

        const interval = setInterval(() => {
            setProgress((prev) => (prev < 90 ? prev + 10 : prev));
        }, 300);

        try {
            const res = await fetch("/api/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();

            if (data.imageUrl) {
                setProgress(100);
                setTimeout(async () => {
                    setImageUrl(data.imageUrl);
                    await deductTokens(session.user.id, 1);
                    await refreshTokenBalance();
                    setLoading(false);
                    clearInterval(interval);
                }, 800);
            } else {
                throw new Error("No image returned");
            }
        } catch (err) {
            console.error("❌ Error generating image:", err);
            alert(t("error"));
            clearInterval(interval);
            setProgress(0);
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (imageUrl) {
            navigator.clipboard.writeText(imageUrl);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 1500);
        }
    };

    const reset = () => {
        setPrompt("");
        setImageUrl(null);
        setProgress(0);
    };

    return (
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 100px)" }}>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t("placeholder")}
                className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-700 focus:border-green-700 min-h-[120px]"
            />

            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className={`flex-1 px-4 py-2 text-sm rounded transition ${loading || !prompt.trim()
                        ? "bg-[#d1e1db] text-white cursor-not-allowed"
                        : "bg-green-700 text-white hover:bg-green-800"
                        }`}
                >
                    {loading ? t("processing") : t("button")}
                </button>

                <div className="flex items-center gap-1 text-xs text-gray-500 pr-1">
                    <DiamondIcon />
                    <span>1</span>
                </div>
            </div>

            {loading && (
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mt-2">
                    <div
                        className="bg-green-600 h-3 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}

            {imageUrl && (
                <div className="text-center space-y-4">
                    <Image
                        src={imageUrl}
                        alt="Generated AI"
                        className="rounded-lg border mx-auto max-w-full h-auto"
                        onClick={handleCopy}
                        title={t("copied")}
                    />
                    <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="text-green-600 underline"
                    >
                        {t("download")}
                    </a>

                    <button
                        onClick={reset}
                        className="block w-full mt-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
                    >
                        {t("generateAnother")}
                    </button>
                </div>
            )}

            {showCopied && (
                <div className="fixed left-1/2 -translate-x-1/2 bottom-28 bg-black text-white text-xs px-3 py-1 rounded shadow-lg z-50 animate-fadeIn">
                    {t("copied")}
                </div>
            )}
        </div>
    );
}
