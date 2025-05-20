"use client";

import { useTranslations } from "next-intl";
import BackgroundRemoval from "./BackgroundRemoval"; // Create this separately
import Upscaling from "./Upscaling"; // Placeholder
import OCR from "./OCR"; // Placeholder
import GenerateImage from "./GenerateImage";

type ImageMode = "generate" | "backgroundRemoval" | "upscaling" | "ocr";

interface ImageToolProps {
    imageMode: ImageMode;
    setImageMode: React.Dispatch<React.SetStateAction<ImageMode>>;
}

export default function ImageTool({ imageMode, setImageMode }: ImageToolProps) {
    const t = useTranslations("imageTools");

    const toolComponents = {
        generate: <GenerateImage />,
        backgroundRemoval: <BackgroundRemoval />,
        upscaling: <Upscaling />,
        ocr: <OCR />,

    };

    const tools = [
        {
            key: "generate",
            label: t("generate"),
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                >
                    <path d="M4 4h16v16H4z" stroke="none" />
                    <path d="M4 16l4-4 4 4 4-6 4 6" />
                </svg>
            ),
        },
        {
            key: "backgroundRemoval",
            label: t("backgroundRemoval"),
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                >
                    <path d="M16 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-1 14h-2v-4h2v4zm0-6h-2V7h2v4z" />
                </svg>
            ),
        },
        {
            key: "upscaling",
            label: t("upscaling"),
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                >
                    <path d="M4 17l6-6 4 4 6-6" />
                    <path d="M2 19h20" />
                </svg>
            ),
        },
        {
            key: "ocr",
            label: t("ocr"),
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                >
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path d="M9 9h6v6H9z" />
                </svg>
            ),
        },

    ] as const;

    return (
        <div className="flex flex-col h-full">
            {/* Active Tool UI */}
            <div className="flex-1 overflow-y-auto">{toolComponents[imageMode]}</div>

            {/* Bottom Tool Selector */}
            <div
                className="fixed bottom-0 left-0 right-0 bg-white shadow-inner z-30"
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
                <div className="flex justify-around items-center px-4 py-2">
                    {tools.map((tool) => (
                        <button
                            key={tool.key}
                            onClick={() => setImageMode(tool.key)}
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm transition ${imageMode === tool.key
                                ? "font-medium"
                                : "text-gray-500 hover:bg-gray-100"
                                }`}
                            style={
                                imageMode === tool.key
                                    ? {
                                        backgroundColor: "rgba(6, 95, 70, 0.1)",
                                        color: "var(--primary-color)",
                                    }
                                    : {}
                            }
                        >
                            {tool.icon}
                            <span>{tool.label}</span>
                        </button>


                    ))}
                </div>
            </div>
        </div>
    );
}
