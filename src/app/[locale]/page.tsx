"use client";

//google auth & firebase imports
import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import "@/app/globals.css";
import { useTranslations } from "next-intl";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase"; // adjust if your firebase init is elsewhere


// componets imports
import Topbar from "@/app/[locale]/layout/Topbar";
import Sidebar from "@/app/[locale]/layout/Sidebar";
import ChatConversation from "@/app/[locale]/ChatConversation";
import ImproveWriting from "@/app/[locale]/ImproveWriting";
import LanguageTranslation from "@/app/[locale]/LanguageTranslation";
import ReplyEmail from "@/app/[locale]/ReplyEmail";
import ImageTool from "@/app/[locale]/ImageTool";


export default function Home() {
  const { data: session } = useSession();
  const [chatMode, setChatMode] = useState<
    "chat" | "improve" | "translate" | "replyEmail"
  >("chat");

  //for sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // default: close
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<"work" | "imageTool">("work");

  //for token update
  const [tokenBalance, setTokenBalance] = useState<number>(0);

  const refreshTokenBalance = async () => {
    if (!session?.user?.id) return;
    const db = getFirestore(app);
    const userRef = doc(db, "users", session.user.id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const tokens = userSnap.data().tokens || 0;
      setTokenBalance(tokens);
    }
  };

  //
  const messagesRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations();


  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatMode]);

  //close sidebar when click outside of sidebar (work in mobile view only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isMobile = window.innerWidth < 768;

      if (
        isMobile &&
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(toggleButtonRef.current?.contains(event.target as Node))
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);



  // Sign in screen
  if (!session) {
    return (

      <main className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
        <h1 className="text-2xl font-semibold mb-4">
          {t("welcomeTitle")}
        </h1>
        <p className="mb-6 text-gray-600">
          {t("welcomeSubtitle")}
        </p>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          {t("signInButton")}
        </button>

      </main>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Topbar */}
      <Topbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        toggleButtonRef={toggleButtonRef}
        tokenBalance={tokenBalance} // ✅ Add this
      />

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        sidebarRef={sidebarRef}
        setIsSidebarOpen={setIsSidebarOpen}
        setCurrentView={setCurrentView}
        currentView={currentView}
      />

      {/*Modes window*/}
      <main className={`flex flex-col flex-1 h-full transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64" : ""}`}>

        <div className="flex flex-col flex-1 w-full pb-45 overflow-y-auto">
          {currentView === "work" && (
            <>
              <ChatConversation
                isSidebarOpen={isSidebarOpen}
                refreshTokenBalance={refreshTokenBalance}
              />
              {chatMode === "improve" && <ImproveWriting />}
              {chatMode === "translate" && <LanguageTranslation />}
              {chatMode === "replyEmail" && <ReplyEmail />}

              {/* bottom sticky section */}
              <div
                className={`bg-white z-30 fixed bottom-0 right-0 left-0 transition-all duration-300 ${isSidebarOpen ? "md:left-64" : ""
                  }`}
                style={{
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
                      label: "modeChat",
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
                      label: "modeImprove",
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
                      label: "modeTranslate",
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
                      label: "modeReply",
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
                      <span>{t(mode.label)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentView === "imageTool" && <ImageTool />}



        </div>
      </main>
    </div>
  );
}
