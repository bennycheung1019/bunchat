"use client";

import { useState } from "react";

const styles = [
    { label: "The Simpsons", prompt: "in The Simpsons cartoon style" },
    { label: "Ghibli Style", prompt: "in Studio Ghibli animated style" },
    { label: "Action Figure", prompt: "as an action figure" },
];

export default function GenerateImage() {
    const [selectedStyle, setSelectedStyle] = useState(styles[0]);
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!uploadedImage || !selectedStyle) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("image", uploadedImage);
            formData.append("style", selectedStyle.prompt);

            const res = await fetch("/api/generate-image", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            setGeneratedImage(data.generatedImageUrl || null);
        } catch (err) {
            console.error("Generation error:", err);
            alert("Failed to generate image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto w-full space-y-6">
            {/* Uploaded Image Preview */}
            {previewImage && (
                <div className="w-full flex justify-center">
                    <img
                        src={previewImage}
                        alt="Uploaded Preview"
                        className="w-60 h-60 object-cover rounded-lg border"
                    />
                </div>
            )}

            {/* Style Selector */}
            <div className="flex gap-3 overflow-x-auto py-2">
                {styles.map((style) => (
                    <button
                        key={style.label}
                        onClick={() => setSelectedStyle(style)}
                        className={`flex-shrink-0 px-4 py-2 text-sm rounded-full border transition whitespace-nowrap ${selectedStyle.label === style.label
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                            }`}
                    >
                        {style.label}
                    </button>
                ))}
            </div>

            {/* Upload area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 transition">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="upload"
                />
                <label htmlFor="upload" className="cursor-pointer text-center">
                    {uploadedImage ? "Change Image" : "Click to Upload an Image"}
                </label>
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={!uploadedImage || loading}
                className={`w-full px-4 py-2 rounded-md text-white font-semibold transition ${uploadedImage
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-300 cursor-not-allowed"
                    }`}
            >
                {loading ? "Generating..." : "Generate Image"}
            </button>

            {/* Generated Image Display */}
            {generatedImage && (
                <div className="space-y-4 pt-6 text-center">
                    <img
                        src={generatedImage}
                        alt="Generated Cartoon"
                        className="w-60 h-60 object-cover rounded-lg mx-auto border"
                    />
                    <div className="flex justify-center gap-4">
                        <button className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition">
                            Save / Share
                        </button>
                        <button
                            onClick={() => {
                                setGeneratedImage(null);
                                setUploadedImage(null);
                                setPreviewImage(null);
                            }}
                            className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition"
                        >
                            Leave
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
