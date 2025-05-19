"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import DiamondIcon from "@/components/icons/DiamondIcon";
import { useSession } from "next-auth/react";
import { useTokenContext } from "@/context/TokenContext";
import { deductTokens } from "@/lib/tokenUtils";

export default function BackgroundRemoval() {
    const t = useTranslations("background");
    const { data: session } = useSession();
    const { refreshTokenBalance } = useTokenContext();

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
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

    const handleRemoveBackground = async () => {
        if (!uploadedImage || !previewUrl) return;
        setLoading(true);
        setProgress(10);

        const interval = setInterval(() => {
            setProgress((prev) => (prev < 90 ? prev + 10 : prev));
        }, 400);

        try {
            const res = await fetch("/api/remove-background", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: previewUrl }),
            });

            const data = await res.json();
            if (data.resultUrl) {
                setProgress(100);
                setTimeout(async () => {
                    setResultUrl(data.resultUrl);
                    setLoading(false);
                    clearInterval(interval);

                    if (data.resultUrl && session?.user?.id) {
                        await deductTokens(session.user.id, 1); //TOKEN AMOUNT HERE
                        await refreshTokenBalance();
                    }
                }, 800);
            } else {
                throw new Error("API failed");
            }
        } catch (err) {
            console.error(err);
            alert(t("errorApi"));
            setProgress(0);
            clearInterval(interval);
            setLoading(false);
        }
    };

    const reset = () => {
        setUploadedImage(null);
        setPreviewUrl(null);
        setResultUrl(null);
        setImageInfo(null);
        setProgress(0);
    };

    return (
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 100px)" }}>
            {resultUrl ? (
                <>
                    <div className="text-center">
                        <Image src={resultUrl} alt="Result" width={400} height={400} className="object-contain rounded mx-auto" />
                        <a href={resultUrl} download className="text-green-600 underline block mt-2">{t("download")}</a>
                    </div>
                    <button
                        onClick={reset}
                        className="mt-6 w-full py-2 rounded text-white font-semibold bg-green-600 hover:bg-green-700"
                    >
                        {t("removeAnother")}
                    </button>
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
                                    {imageInfo.width}x{imageInfo.height}px • {imageInfo.sizeMB}MB
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

                    {/* Action Button with Cost */}
                    <div className="flex items-center justify-between w-full gap-4">
                        <button
                            onClick={handleRemoveBackground}
                            disabled={!uploadedImage || loading}
                            className={`flex-1 px-4 py-2 text-sm rounded transition ${uploadedImage
                                ? "bg-green-700 text-white hover:bg-green-800"
                                : "bg-[#d1e1db] text-white cursor-not-allowed"
                                }`}
                        >
                            {loading ? t("processing") : t("removeButton")}
                        </button>

                        {/* 💎 Token Cost */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 pr-1">
                            <DiamondIcon />
                            <span>1</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
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
