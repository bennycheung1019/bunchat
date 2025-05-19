"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import DiamondIcon from "@/components/icons/DiamondIcon";
import { useSession } from "next-auth/react";
import { useTokenContext } from "@/context/TokenContext";
import { deductTokens } from "@/lib/tokenUtils";

export default function Upscaling() {
    const t = useTranslations("upscale");
    const { data: session } = useSession();
    const { refreshTokenBalance } = useTokenContext();

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [imageInfo, setImageInfo] = useState<{ width: number; height: number; sizeMB: number } | null>(null);
    const [resultInfo, setResultInfo] = useState<{ width: number; height: number; sizeMB: number } | null>(null);
    const [scale, setScale] = useState<2 | 4 | 6 | 8>(2);
    const [faceEnhance, setFaceEnhance] = useState(true);
    const [outputSize, setOutputSize] = useState<{ width: number; height: number } | null>(null);
    const [tokenCost, setTokenCost] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (imageInfo && scale) {
            const width = imageInfo.width * scale;
            const height = imageInfo.height * scale;
            setOutputSize({ width, height });
            const pixelCount = width * height;
            const maxPixels = 7680 * 4320; // 8K limit
            if (pixelCount > maxPixels) {

                setOutputSize(null);
                setTokenCost(0);
            } else {
                const tokens = Math.ceil(pixelCount / (1000 * 1000));
                setTokenCost(tokens);
            }
        } else {
            setOutputSize(null);
            setTokenCost(0);
        }
    }, [imageInfo, scale]);

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
                setImageInfo({
                    width: img.width,
                    height: img.height,
                    sizeMB: +(file.size / (1024 * 1024)).toFixed(2),
                });
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

    const handleUpscale = async () => {
        if (!uploadedImage || !previewUrl || !session?.user?.id) return;

        setLoading(true);
        setProgress(10);
        const interval = setInterval(() => {
            setProgress((prev) => (prev < 90 ? prev + 10 : prev));
        }, 400);

        try {
            const res = await fetch("/api/upscale-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: previewUrl, scale, face_enhance: faceEnhance }),
            });

            const data = await res.json();
            if (data.resultUrl) {
                setProgress(100);
                setTimeout(async () => {
                    setResultUrl(data.resultUrl);

                    const img = document.createElement("img");
                    img.src = data.resultUrl;
                    img.onload = async () => {
                        const response = await fetch(data.resultUrl);
                        const blob = await response.blob();
                        const width = img.width;
                        const height = img.height;
                        const sizeMB = +(blob.size / (1024 * 1024)).toFixed(2);
                        setResultInfo({ width, height, sizeMB });
                    };

                    await deductTokens(session.user.id, tokenCost);
                    await refreshTokenBalance();
                    clearInterval(interval);
                    setLoading(false);
                }, 800);
            } else {
                throw new Error("Upscaling failed.");
            }
        } catch (err) {
            console.error("❌ handleUpscale error:", err);
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
        setResultInfo(null);
        setProgress(0);
        setOutputSize(null);
        setTokenCost(0);
    };

    return (
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 100px)" }}>
            {resultUrl ? (
                <>
                    <div className="text-center">
                        <Image src={resultUrl} alt="Upscaled Result" width={400} height={400} className="object-contain rounded mx-auto" />
                        {resultInfo && (
                            <p className="text-sm text-gray-500 mt-2">
                                {resultInfo.width}×{resultInfo.height}px • {resultInfo.sizeMB}MB
                            </p>
                        )}
                        <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 underline block mt-2">
                            {t("download")}
                        </a>
                    </div>
                    <button
                        onClick={reset}
                        className="mt-6 w-full py-2 rounded text-white font-semibold bg-green-600 hover:bg-green-700"
                    >
                        {t("upscaleAnother")}
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

                    {/* Controls Section - Improved layout */}
                    <div className="bg-gray-50 p-4 rounded-lg shadow mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-semibold text-gray-800">
                                {t("scale") || "Scale"}: <span className="text-lg font-bold text-green-700">{scale}×</span>
                            </label>

                            <input
                                type="range"
                                min={2}
                                max={8}
                                step={2}
                                value={scale}
                                onChange={(e) => setScale(Number(e.target.value) as 2 | 4 | 8)}
                                className="w-2/3"
                            />

                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">{t("faceEnhance") || "Face Enhance"}</label>
                            <input
                                type="checkbox"
                                checked={faceEnhance}
                                onChange={(e) => setFaceEnhance(e.target.checked)}
                                className="w-5 h-5 accent-green-600"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full gap-4">
                        <button
                            onClick={handleUpscale}
                            disabled={!uploadedImage || loading || !outputSize}
                            className={`flex-1 px-4 py-2 text-sm rounded transition ${uploadedImage && outputSize
                                ? "bg-green-700 text-white hover:bg-green-800"
                                : "bg-[#d1e1db] text-white cursor-not-allowed"
                                }`}

                        >
                            {loading
                                ? t("processing")
                                : outputSize
                                    ? t("upscaleTo", { width: outputSize.width, height: outputSize.height })
                                    : t("upscaleButton")}

                        </button>


                        <div className="flex items-center gap-1 text-xs text-gray-500 pr-1">
                            <DiamondIcon />
                            <span>{tokenCost}</span>
                        </div>
                    </div>

                    {loading && (
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mt-4">
                            <div
                                className="bg-blue-600 h-3 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>

                    )}
                    {uploadedImage && !outputSize && (
                        <p className="text-xs text-red-500 text-center mt-2">
                            {t("exceedsLimit")}
                        </p>
                    )}

                </>
            )}
        </div>
    );
}
