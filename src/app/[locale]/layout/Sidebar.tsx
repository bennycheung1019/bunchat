"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface SidebarProps {
    isSidebarOpen: boolean;
    sidebarRef: React.RefObject<HTMLDivElement | null>;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentView: (view: "work" | "imageTool") => void;
    currentView: "work" | "imageTool";
}

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    sidebarRef,
    setIsSidebarOpen,
    setCurrentView,
    currentView,
}) => {
    const t = useTranslations();

    return (
        <div
            id="chat-library"
            ref={sidebarRef}
            className={`
                fixed left-0 top-[56px] w-64
                bg-white border-r border-zinc-200 px-4 py-6
                shadow-md z-40 transition-transform duration-300 ease-in-out
                flex flex-col flex-1 h-full
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-64"}
            `}
        >
            <h2 className="text-lg font-semibold text-zinc-800 mb-6 text-center tracking-wide">
                {t("sidebar.navigation")}
            </h2>

            <div className="space-y-2">
                {/* Work Button */}
                <button
                    onClick={() => {
                        setCurrentView("work");
                        setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm font-medium transition ${currentView === "work"
                        ? "bg-primary-light text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {t("sidebar.work")}
                </button>

                {/* Image Tool Button */}
                <button
                    onClick={() => {
                        setCurrentView("imageTool");
                        setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm font-medium transition ${currentView === "imageTool"
                        ? "bg-primary-light text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                >
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
                    {t("sidebar.imageTool") || "Image Tool"}
                </button>
            </div>

            {/* Bottom logo with env-safe padding like mode-selector */}
            <div
                className="flex flex-col flex-1 mt-auto w-full pt-2 md:pt-6 md:pb-34 bg-white overflow-y-auto"
            >
                <div
                    className="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-0 opacity-70 text-sm"
                    style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                >
                    {/* Clickable logo */}
                    <a href="/landing" className="block w-28">
                        <img
                            src="/minimindLogo-en.png"
                            alt="minimind logo"
                            className="w-full h-auto"
                        />
                    </a>

                    {/* Version number */}
                    <span className="text-gray-400">v0.0.3</span>
                </div>


            </div>

        </div>
    );
};

export default Sidebar;
