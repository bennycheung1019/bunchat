// components/layout/Sidebar.tsx
"use client";

import React from "react";
import { Session } from "next-auth";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarRef: React.RefObject<HTMLDivElement>;
  menuRef: React.RefObject<HTMLDivElement>;
  chatSessions: string[];
  setChatSessions: React.Dispatch<React.SetStateAction<string[]>>;
  activeChat: number;
  setActiveChat: (index: number) => void;
  renamingIndex: number | null;
  setRenamingIndex: (index: number | null) => void;
  menuOpenIndex: number | null;
  setMenuOpenIndex: (index: number | null) => void;
  handleDeleteChat: (index: number) => void;
  handleNewChat: () => void;
  session: Session | null;
  loadMessages: (
    userId: string,
    sessionId: string
  ) => Promise<{ role: "user" | "ai"; text: string }[]>;
  setMessages: (messages: { role: "user" | "ai"; text: string }[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  sidebarRef,
  menuRef,
  chatSessions,
  activeChat,
  setActiveChat,
  renamingIndex,
  setRenamingIndex,
  menuOpenIndex,
  setMenuOpenIndex,
  handleDeleteChat,
  handleNewChat,
  session,
  loadMessages,
  setMessages,
}) => {
  return (
    <div
      id="chat-library"
      ref={sidebarRef}
      className={`
        w-64 shrink-0 bg-white border-r border-zinc-200 p-4 md:overflow-y-auto shadow-sm z-40
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-64"}
      `}
      style={{
        visibility: isSidebarOpen ? "visible" : "hidden",
        position: "relative",
      }}
    >
      <h2 className="text-lg font-semibold text-zinc-800 mb-4 text-center">
        Chat Library
      </h2>

      <button
        id="new-chat-button"
        onClick={handleNewChat}
        className="w-full mb-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md shadow hover:bg-blue-700 transition"
      >
        New Chat +
      </button>

      <ul id="chat-list" className="space-y-2">
        {chatSessions.map((title, index) => (
          <li
            key={index}
            className={`group p-2 rounded-md cursor-pointer transition ${
              index === activeChat
                ? "bg-blue-100 text-blue-900"
                : "hover:bg-zinc-100 text-zinc-800"
            }`}
            onClick={async () => {
              if (menuOpenIndex !== null) return;
              setActiveChat(index);

              const userId = session?.user?.id;
              const sessionId = `session-${index}`;

              if (userId) {
                const history = await loadMessages(userId, sessionId);
                setMessages(history);
              } else {
                setMessages([]);
              }
            }}
          >
            <div className="flex items-center justify-between w-full">
              {renamingIndex === index ? (
                <input
                  autoFocus
                  value={chatSessions[index]}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const copy = [...chatSessions];
                    copy[index] = newTitle;
                    setDoc(
                      doc(
                        db,
                        "users",
                        session?.user?.id || "anonymous",
                        "chats",
                        `session-${index}`
                      ),
                      { title: newTitle },
                      { merge: true }
                    );
                  }}
                  onBlur={() => setRenamingIndex(null)}
                  className="bg-white border border-zinc-300 px-2 py-1 rounded text-sm w-full shadow-sm"
                />
              ) : (
                <span className="text-sm truncate">{chatSessions[index]}</span>
              )}

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenIndex(menuOpenIndex === index ? null : index);
                  }}
                  className="ml-2 text-gray-500 hover:text-black"
                >
                  ⋯
                </button>

                {menuOpenIndex === index && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 w-40 bg-white border rounded shadow text-sm z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
                      onClick={() => {
                        setRenamingIndex(index);
                        setMenuOpenIndex(null);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      className="block w-full px-4 py-2 hover:bg-red-100 text-left text-red-600"
                      onClick={() => {
                        handleDeleteChat(index);
                        setMenuOpenIndex(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
