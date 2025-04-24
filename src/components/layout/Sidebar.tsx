// components/layout/Sidebar.tsx
"use client";

interface SidebarProps {
    isSidebarOpen: boolean;
    sidebarRef: React.RefObject<HTMLDivElement | null>;
    setCurrentView: (view: "work" | "generateImage") => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isSidebarOpen,
    sidebarRef,
    setCurrentView,
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

            <div className="flex flex-col gap-3">
                <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-700 rounded-md hover:bg-blue-100 transition"
                    onClick={() => setCurrentView("work")}
                >
                    🛠️ Work
                </button>

                <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-700 rounded-md hover:bg-blue-100 transition"
                    onClick={() => setCurrentView("generateImage")}
                >
                    🖼️ Generate Image
                </button>
            </div>
        </div>

    );
};

export default Sidebar;
