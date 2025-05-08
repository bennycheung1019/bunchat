"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function BackgroundRemoval() {
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
            alert("File size exceeds 10MB limit.");
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

        try {
            const interval = setInterval(() => {
                setProgress((prev) => (prev < 90 ? prev + 10 : prev));
            }, 400);

            const res = await fetch("/api/remove-background", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: previewUrl }),
            });

            const data = await res.json();
            if (data.resultUrl) {
                setResultUrl(data.resultUrl);
                setProgress(100);
            } else {
                throw new Error("API failed");
            }

            clearInterval(interval);
        } catch (err) {
            console.error(err);
            alert("Failed to remove background.");
            setProgress(0);
        } finally {
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
                        <a href={resultUrl} download className="text-blue-500 underline block mt-2">Download Result</a>
                    </div>
                    <button
                        onClick={reset}
                        className="mt-6 w-full py-2 rounded text-white font-semibold bg-blue-600 hover:bg-blue-700"
                    >
                        Remove Another Image
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
                            className="border-2 border-dashed border-gray-300 p-6 rounded text-center hover:border-blue-400 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
                                className="hidden"
                            />
                            <p className="text-blue-600">Click or drag image here to upload (max 10MB)</p>
                        </div>
                    )}

                    <button
                        onClick={handleRemoveBackground}
                        disabled={!uploadedImage || loading}
                        className={`w-full py-2 rounded text-white font-semibold transition ${uploadedImage ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"}`}
                    >
                        {loading ? "Processing..." : "Remove Background"}
                    </button>

                    {/* Progress Bar */}
                    {loading && (
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mt-4">
                            <div
                                className="bg-blue-500 h-3 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
