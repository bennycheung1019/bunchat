"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface TopbarProps {
  onToggleSidebar: () => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
}

const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, toggleButtonRef }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if click outside
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
                Settings
              </button>
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Topbar;
