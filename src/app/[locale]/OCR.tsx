"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import DiamondIcon from "@/components/icons/DiamondIcon";
import { useSession } from "next-auth/react";
import { useTokenContext } from "@/context/TokenContext";
import { deductTokens } from "@/lib/tokenUtils";

export default function OCR() {
    const t = useTranslations("ocr");
    const tCommon = useTranslations("common");
    const { data: session } = useSession();
    const { refreshTokenBalance } = useTokenContext();

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [outputText, setOutputText] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showCopied, setShowCopied] = useState(false);
    const [imageInfo, setImageInfo] = useState<{ width: number; height: number; sizeMB: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (file: File) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            alert(t("errorTooLarge"));
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.createElement("img");
            img.src = event.target?.result as string;
            img.onload = () => {
                setImageInfo({ width: img.width, height: img.height, sizeMB: +(file.size / (1024 * 1024)).toFixed(2) });
                setPreviewUrl(event.target?.result as string);
            };
        };
        reader.readAsDataURL(file);
        setUploadedImage(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    const handleExtractText = async () => {
        if (!uploadedImage || !previewUrl || !session?.user?.id) return;

        setLoading(true);
        setProgress(10);
        const interval = setInterval(() => {
            setProgress((prev) => (prev < 90 ? prev + 10 : prev));
        }, 400);

        try {
            const res = await fetch("/api/extract-text", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: previewUrl }),
            });

            const data = await res.json();
            if (data.resultText) {
                setOutputText(data.resultText);
                await deductTokens(session.user.id, 1);
                await refreshTokenBalance();
            } else {
                throw new Error("OCR failed.");
            }
        } catch (err) {
            console.error("❌ OCR Error:", err);
            alert(t("errorApi"));
        } finally {
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => setLoading(false), 800);
        }
    };

    const reset = () => {
        setUploadedImage(null);
        setPreviewUrl(null);
        setOutputText("");
        setImageInfo(null);
        setProgress(0);
    };

    const handleCopy = () => {
        if (!outputText) return;
        navigator.clipboard.writeText(outputText);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 1500);
    };

    return (
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 100px)" }}>
            {!outputText && (
                <p className="text-sm text-gray-500 text-center">
                    ⚠️ {t("ocrEnglishOnly")}
                </p>
            )}

            {outputText ? (
                <>
                    <div
                        className="p-4 rounded-lg bg-yellow-50 text-yellow-900 border border-yellow-200 shadow-inner cursor-pointer whitespace-pre-line hover:ring-2 ring-yellow-300 transition"
                        onClick={handleCopy}
                    >
                        {outputText || t("placeholderOutput")}
                    </div>

                    <button
                        onClick={reset}
                        className="mt-6 w-full py-2 rounded text-white font-semibold bg-green-600 hover:bg-green-700"
                    >
                        {t("extractAnother")}
                    </button>

                    {showCopied && (
                        <div className="fixed left-1/2 -translate-x-1/2 bottom-28 bg-black text-white text-xs px-3 py-1 rounded shadow-lg z-50 animate-fadeIn">
                            {tCommon("copied")}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {previewUrl && (
                        <div className="text-center space-y-2">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                width={400}
                                height={400}
                                className="object-contain rounded border mx-auto"
                            />
                            {imageInfo && (
                                <p className="text-sm text-gray-500">
                                    {imageInfo.width}×{imageInfo.height}px • {imageInfo.sizeMB}MB
                                </p>
                            )}
                        </div>
                    )}

                    {!previewUrl && (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="border-2 border-dashed border-gray-300 p-6 rounded text-center hover:border-green-500 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
                                className="hidden"
                            />
                            <p className="text-primary">{t("uploadHint")}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between w-full gap-4">
                        <button
                            onClick={handleExtractText}
                            disabled={!uploadedImage || loading}
                            className={`flex-1 px-4 py-2 text-sm rounded transition ${uploadedImage
                                ? "bg-green-700 text-white hover:bg-green-800"
                                : "bg-[#d1e1db] text-white cursor-not-allowed"
                                }`}
                        >
                            {loading ? t("processing") : t("extractButton")}
                        </button>

                        <div className="flex items-center gap-1 text-xs text-gray-500 pr-1">
                            <DiamondIcon />
                            <span>1</span>
                        </div>
                    </div>

                    {loading && (
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mt-4">
                            <div
                                className="bg-green-600 h-3 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
