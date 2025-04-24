"use client";

import React from "react";

interface SidebarProps {
    isSidebarOpen: boolean;
    sidebarRef: React.RefObject<HTMLDivElement | null>;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrentView: (view: "work" | "generateImage") => void;
    currentView: "work" | "generateImage";
}

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    sidebarRef,
    setIsSidebarOpen,
    setCurrentView,
    currentView,
}) => {
    return (
        <div
            id="chat-library"
            ref={sidebarRef}
            className={`
        fixed left-0 top-[56px] w-64 h-[calc(100vh-56px)]
        bg-white border-r border-zinc-200 px-4 py-6
        shadow-md z-40 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-64"}
      `}
        >
            <h2 className="text-lg font-semibold text-zinc-800 mb-6 text-center tracking-wide">
                Navigation
            </h2>

            <div className="space-y-2">
                {/* Work Button */}
                <button
                    onClick={() => {
                        setCurrentView("work");
                        setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm font-medium transition ${currentView === "work"
                        ? "bg-blue-100 text-blue-600"
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
                    Work
                </button>

                {/* Generate Image Button */}
                <button
                    onClick={() => {
                        setCurrentView("generateImage");
                        setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm font-medium transition ${currentView === "generateImage"
                        ? "bg-blue-100 text-blue-600"
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
                    Generate Image
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
