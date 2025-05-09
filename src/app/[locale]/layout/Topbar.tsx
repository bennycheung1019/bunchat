"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useTokenContext } from "@/context/TokenContext";


interface TopbarProps {
  onToggleSidebar: () => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
}

const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, toggleButtonRef }) => {
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
          {/* ✅ Token Balance Display */}
          <button
            onClick={() => router.push("/purchase-tokens")}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 hover:shadow transition duration-200"
            title="Click to buy more tokens"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 3L3 9l9 12 9-12-3-6H6z" />
            </svg>

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
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2 text-sm z-40">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push("/settings");
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  {t("settings")}
                </button>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
