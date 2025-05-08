"use client";

import { useState } from "react";
import Image from "next/image";

export default function BackgroundRemoval() {
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [imageInfo, setImageInfo] = useState<{ width: number; height: number; sizeMB: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUploadFile = (file: File) => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert("File size exceeds 10MB limit.");
            return;
        }

        setUploadedImage(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                setImageInfo({
                    width: img.width,
                    height: img.height,
                    sizeMB: +(file.size / 1024 / 1024).toFixed(2),
                });
            };
            if (event.target?.result) {
                setPreviewUrl(event.target.result as string);
                img.src = event.target.result as string;
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUploadFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleUploadFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleRemoveBackground = async () => {
        if (!uploadedImage) return;
        setLoading(true);
        setProgress(0);

        try {
            // Animate fake progress
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 95) return prev + 5;
                    return prev;
                });
            }, 300);

            const res = await fetch("/api/remove-background", {
                method: "POST",
                body: JSON.stringify({ imageUrl: previewUrl }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            setResultUrl(data.resultUrl);

            clearInterval(progressInterval);
            setProgress(100);
        } catch (err) {
            console.error(err);
            alert("Background removal failed.");
        } finally {
            setLoading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    const handleReset = () => {
        setUploadedImage(null);
        setPreviewUrl(null);
        setResultUrl(null);
        setImageInfo(null);
        setProgress(0);
        setLoading(false);
    };

    return (
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
            {/* --- Show Upload + Preview + Remove Button if not finished --- */}
            {!resultUrl && (
                <>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-gray-300 p-8 rounded text-center hover:border-blue-400 cursor-pointer"
                    >
                        <input
                            type="file"
                            accept="image/*"
                            id="upload"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label htmlFor="upload" className="text-blue-600 block">
                            {uploadedImage ? "Change Image" : "Click or Drag Image to Upload"}
                        </label>
                        {imageInfo && (
                            <div className="text-gray-500 text-sm mt-2">
                                {imageInfo.width} × {imageInfo.height}px • {imageInfo.sizeMB} MB
                            </div>
                        )}
                    </div>

                    {/* Preview Uploaded Image */}
                    {previewUrl && (
                        <div className="w-full max-w-xs md:max-w-md mx-auto">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                width={800}
                                height={800}
                                className="object-contain w-full h-auto rounded border"
                            />
                        </div>
                    )}

                    {/* Progress Bar */}
                    {loading && (
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    )}

                    {/* Remove Background Button */}
                    <button
                        onClick={handleRemoveBackground}
                        disabled={!uploadedImage || loading}
                        className={`w-full py-2 rounded text-white font-semibold transition ${uploadedImage ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"
                            }`}
                    >
                        {loading ? "Processing..." : "Remove Background"}
                    </button>
                </>
            )}

            {/* --- Show Result only if finished --- */}
            {resultUrl && (
                <div className="text-center space-y-4">
                    <div className="w-full max-w-xs md:max-w-md mx-auto">
                        <Image
                            src={resultUrl}
                            alt="Result"
                            width={800}
                            height={800}
                            className="object-contain w-full h-auto rounded mx-auto border"
                        />
                    </div>
                    <a href={resultUrl} download className="text-blue-500 underline block">
                        Download Result
                    </a>
                    <button
                        onClick={handleReset}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    >
                        Remove Background from Another Image
                    </button>
                </div>
            )}
        </div>
    );
}
