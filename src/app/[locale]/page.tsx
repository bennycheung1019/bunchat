"use client";

//google auth & firebase imports
import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import "@/app/globals.css";
import { useTranslations } from "next-intl";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from "@/lib/firebase"; // adjust if needed

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

  //
  const messagesRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations();

  //Create Email and Tokens for the first login

  useEffect(() => {
    const saveUserToFirestore = async () => {
      if (!session?.user?.id || !session.user.email) return;

      const db = getFirestore(app);
      const userRef = doc(db, "users", session.user.id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: session.user.email,
          createdAt: serverTimestamp(),
          tokens: 10, // optional default token count
        });
        console.log("📦 New user created in Firestore");
      }
    };

    saveUserToFirestore();
  }, [session]);

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

      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center space-y-8">

          {/* Logo and Title - Combined */}
          <div className="flex flex-col items-center space-y-3">
            <img src="/minimindLogo-noText.png" alt="MiniMind Logo" className="h-16 w-auto" />
            <h1 className="text-2xl font-bold text-gray-900">{t("signin.title")}</h1>
          </div>

          {/* Subtitle */}
          <p className="text-gray-500 text-sm leading-relaxed">
            {t("signin.subtitle")}
          </p>

          {/* Sign In Button */}
          <div className="mt-6">
            <button
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.5-5.9 7.7-11.3 7.7-6.5 0-11.8-5.3-11.8-11.8S17.5 12 24 12c3 0 5.8 1.1 7.9 3l6-6C34.2 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.3-7.7 20.7-18 0.1-0.9 0.1-1.5 0.1-2.5 0-1-0.1-1.7-0.2-2.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C15.1 15.3 19.3 12 24 12c3 0 5.8 1.1 7.9 3l6-6C34.2 5.1 29.3 3 24 3c-7.3 0-13.7 3.1-18 8z" />
                <path fill="#4CAF50" d="M24 45c5.2 0 10-1.8 13.7-4.9l-6.4-5.3C29.6 36.7 26.9 38 24 38c-5.4 0-9.9-3.4-11.5-8.1l-6.6 5C10.3 41 16.7 45 24 45z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-0.7 2-1.9 3.8-3.5 5.1l0 0 6.4 5.3C40.9 34.7 43 29.8 43.6 24c0.1-0.9 0.1-1.5 0.1-2.5 0-1-0.1-1.7-0.2-2.5z" />
              </svg>
              <span>{t("signin.button")}</span>
            </button>
          </div>

          {/* Footnote */}
          <p className="text-xs text-gray-400 mt-4">{t("signin.note")}</p>
        </div>
      </main>



    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Topbar */}
      <Topbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        toggleButtonRef={toggleButtonRef}
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
              {chatMode === "chat" && (
                <ChatConversation isSidebarOpen={isSidebarOpen} />
              )}

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
