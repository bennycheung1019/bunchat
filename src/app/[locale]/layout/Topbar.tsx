"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useTokenContext } from "@/context/TokenContext";
import DiamondIcon from "@/components/icons/DiamondIcon";

interface TopbarProps {
  onToggleSidebar: () => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
  currentView: "work" | "imageTool" | "videoTool";
  chatMode: "chat" | "improve" | "translate" | "replyEmail";
  imageMode: "generate" | "backgroundRemoval" | "upscaling" | "ocr";
}

const Topbar: React.FC<TopbarProps> = ({
  onToggleSidebar,
  toggleButtonRef,
  currentView,
  chatMode,
  imageMode,
}) => {

  const { data: session } = useSession();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  const { tokenBalance } = useTokenContext();
  console.log("🔵 Topbar received tokenBalance:", tokenBalance);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="sticky top-0 z-30 w-full bg-white shadow-sm">
      <div className="h-14 flex items-center px-4 justify-between">
        {/* Sidebar toggle button */}
        <button
          ref={toggleButtonRef}
          className="w-10 h-10 flex items-center justify-center bg-white hover:bg-zinc-100 transition rounded-md shadow-sm border border-zinc-200"
          onClick={onToggleSidebar}
        >
          <span className="text-xl">☰</span>
        </button>

        {/* Token balance and Avatar */}
        <div className="flex items-center gap-4">
          {/* Token Balance Button */}
          <button
            onClick={() => router.push("/purchase-tokens")}
            className="flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium transition duration-200 hover:shadow"
            style={{
              backgroundColor: "rgba(6, 95, 70, 0.1)",
              borderColor: "rgba(6, 95, 70, 0.3)",
              color: "var(--primary-color)",
            }}
            title="Click to buy more tokens"
          >
            <DiamondIcon className="w-4 h-4 text-[var(--primary-color)]" />
            {tokenBalance}
          </button>

          {/* Avatar + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition"
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  ?
                </div>
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg text-sm z-40">
                {/* Email Header (non-scrollable) */}
                {session?.user?.email && (
                  <div className="px-4 py-2 text-xs text-gray-500 border-b select-none cursor-default">
                    <div className="uppercase tracking-wide text-[10px] font-semibold mb-1 text-gray-400">
                      {t("topbar.signedInAs")}
                    </div>
                    <div
                      className="text-sm text-gray-800 truncate"
                      style={{
                        pointerEvents: "none",
                        userSelect: "text",
                        cursor: "default",
                        WebkitTouchCallout: "none",
                        WebkitUserSelect: "text",
                        msUserSelect: "text",
                      }}
                    >
                      {session.user.email}
                    </div>
                  </div>
                )}


                {/* Scrollable Options */}
                <div className="py-2 max-h-[360px] overflow-y-auto">
                  {/* Purchase Tokens */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push("/purchase-tokens");
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <DiamondIcon className="w-4 h-4 text-blue-500" />
                    {t("topbar.purchaseTokens")}
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      localStorage.setItem("previousView", JSON.stringify({
                        view: currentView,
                        chatMode,
                        imageMode,
                      }));
                      router.push("/settings");
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.03-3.5a7.03 7.03 0 0 0-.14-1.5l2.1-1.65a.5.5 0 0 0 .12-.65l-2-3.46a.5.5 0 0 0-.6-.22l-2.48 1a7.04 7.04 0 0 0-1.3-.75l-.38-2.65a.5.5 0 0 0-.5-.42h-4a.5.5 0 0 0-.5.42l-.38 2.65a7.04 7.04 0 0 0-1.3.75l-2.48-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.65l2.1 1.65a7.03 7.03 0 0 0 0 3l-2.1 1.65a.5.5 0 0 0-.12.65l2 3.46c.14.24.44.34.7.22l2.48-1c.4.3.83.56 1.3.75l.38 2.65a.5.5 0 0 0 .5.42h4a.5.5 0 0 0 .5-.42l.38-2.65c.47-.19.9-.45 1.3-.75l2.48 1c.26.12.56.02.7-.22l2-3.46a.5.5 0 0 0-.12-.65l-2.1-1.65c.09-.48.14-.98.14-1.5z" />
                    </svg>
                    {t("topbar.settings")}
                  </button>

                  <div className="my-2 border-t border-gray-200" />

                  {/* Help & FAQ */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push("/help");
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M12 18h.01M12 14c0-1.5 2-2 2-4a2 2 0 0 0-4 0" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    {t("topbar.helpFaq")}
                  </button>

                  {/* Terms & Policies */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push("/terms");
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M5 4h14v16H5z" />
                      <path d="M9 8h6M9 12h6M9 16h3" />
                    </svg>
                    {t("topbar.termsPolicies")}
                  </button>

                  <div className="my-2 border-t border-gray-200" />

                  {/* Logout */}
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M15 12H3m0 0l4-4m-4 4l4 4M21 3v18" />
                    </svg>
                    {t("topbar.logout")}
                  </button>
                </div>
              </div>
            )}



          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
