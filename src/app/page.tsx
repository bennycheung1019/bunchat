"use client";

//google auth & firebase imports
import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import "@/app/globals.css";

// componets imports
import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import ChatConversation from "@/components/modes/ChatConversation";
import ImproveWriting from "@/components/modes/ImproveWriting";
import LanguageTranslation from "@/components/modes/LanguageTranslation";
import ReplyEmail from "@/components/modes/ReplyEmail";

export default function Home() {
  const { data: session } = useSession();
  const [chatMode, setChatMode] = useState<
    "chat" | "improve" | "translate" | "replyEmail"
  >("chat");

  //for sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // default: close
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<"work" | "generateImage">("work");


  //
  const messagesRef = useRef<HTMLDivElement>(null);


  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatMode]);

  // Sign in screen
  if (!session) {
    return (

      <main className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
        <h1 className="text-2xl font-semibold mb-4">
          Welcome to the AI Chatbot
        </h1>
        <p className="mb-6 text-gray-600">
          Sign in with Google to start chatting
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </main>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Topbar */}
      <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        sidebarRef={sidebarRef}
        setIsSidebarOpen={setIsSidebarOpen}
        setCurrentView={setCurrentView}
        currentView={currentView}
      />

      {/*Modes window*/}
      <main className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : ""}`}>
        <div className="flex flex-col flex-1 w-full pb-45 overflow-y-auto">
          {currentView === "work" && (
            <>
              {chatMode === "chat" && <ChatConversation />}
              {chatMode === "improve" && <ImproveWriting />}
              {chatMode === "translate" && <LanguageTranslation />}
              {chatMode === "replyEmail" && <ReplyEmail />}

              {/* bottom sticky section */}
              <div
                className="bg-white z-30"
                style={{
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  paddingBottom: "env(safe-area-inset-bottom)",
                }}
              >
                {/* mode-selector */}
                <div
                  id="mode-selector"
                  className={`flex justify-around items-center px-4 py-2  bg-white shadow-sm
            }`}
                >
                  {[
                    {
                      label: "Chat",
                      value: "chat",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          viewBox="0 0 24 24"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Improve",
                      value: "improve",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Translate",
                      value: "translate",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 8h14" />
                          <path d="M5 12h9" />
                          <path d="M5 16h6" />
                          <path d="M19 16l-2-3-2 3" />
                        </svg>
                      ),
                    },
                    {
                      label: "Reply",
                      value: "replyEmail",
                      icon: (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 4h16v16H4z" stroke="none" />
                          <path d="M22 12l-6-6v4H8v4h8v4z" />
                        </svg>
                      ),
                    },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setChatMode(mode.value as typeof chatMode)}
                      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm transition ${chatMode === mode.value
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-500 hover:bg-gray-100"
                        }`}
                    >
                      {mode.icon}
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentView === "generateImage" && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>🧠 Image Generator screen coming soon...</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
