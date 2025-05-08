"use client";

import { useState } from "react";
import heic2any from "heic2any"; // Install this: npm install heic2any
import Image from "next/image";

export default function BackgroundRemoval() {
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        let processedFile = file;

        // Check if HEIC and convert
        if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
            try {
                const blob = await heic2any({ blob: file, toType: "image/jpeg" });
                processedFile = new File([blob as BlobPart], file.name.replace(/\.heic/i, ".jpg"), { type: "image/jpeg" });
            } catch (err) {
                console.error("Failed to convert HEIC -> JPEG:", err);
                alert("Failed to process HEIC image.");
                return;
            }
        }

        setUploadedImage(processedFile);

        const reader = new FileReader();
        reader.onload = (event) => setPreviewUrl(event.target?.result as string);
        reader.readAsDataURL(processedFile);
    };



    const handleRemoveBackground = async () => {
        if (!uploadedImage) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("image", uploadedImage);

            const res = await fetch("/api/remove-background", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            setResultUrl(data.resultUrl);
        } catch (err) {
            console.error(err);
            alert("Background removal failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
            {previewUrl && (
                <Image src={previewUrl} alt="Preview" className="w-60 h-60 object-cover rounded border mx-auto" />
            )}

            <div className="border-2 border-dashed border-gray-300 p-6 rounded text-center hover:border-blue-400">
                <input
                    type="file"
                    accept="image/*"
                    id="upload"
                    onChange={handleUpload}
                    className="hidden"
                />
                <label htmlFor="upload" className="cursor-pointer text-blue-600">
                    {uploadedImage ? "Change Image" : "Click to Upload Image"}
                </label>
            </div>

            <button
                onClick={handleRemoveBackground}
                disabled={!uploadedImage || loading}
                className={`w-full py-2 rounded text-white font-semibold transition ${uploadedImage ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"}`}
            >
                {loading ? "Processing..." : "Remove Background"}
            </button>

            {resultUrl && (
                <div className="pt-4 text-center">
                    <Image src={resultUrl} alt="Result" className="w-60 h-60 object-cover rounded mx-auto border" />
                    <a href={resultUrl} download className="text-blue-500 underline block mt-2">Download</a>
                </div>
            )}
        </div>
    );
}
