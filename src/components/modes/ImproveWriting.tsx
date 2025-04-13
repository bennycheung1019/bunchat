"use client";

import React from "react";

interface TopbarProps {
  onToggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-zinc-200 shadow-sm">
      <div className="h-14 flex items-center px-4 justify-between">
        <button
          onClick={onToggleSidebar}
          className="w-10 h-10 flex items-center justify-center bg-white hover:bg-zinc-100 transition rounded-md shadow-sm border border-zinc-200"
        >
          <span className="text-xl">☰</span>
        </button>
        {/* Optional: Center title or logo */}
        {/* <h1 className="text-lg font-semibold text-zinc-700">BunChat</h1> */}
        <div className="w-10 h-10" /> {/* Placeholder to balance layout */}
      </div>
    </header>
  );
};

export default Topbar;
