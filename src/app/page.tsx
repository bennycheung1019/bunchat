// page.tsx
"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { saveMessage } from "@/lib/saveMessage";
import { loadMessages } from "@/lib/loadMessages";
import { db } from "@/lib/firebase";
import {
  deleteDoc,
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import "@/app/globals.css";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatSessions, setChatSessions] = useState<string[]>(["Chat 1"]);
  const [activeChat, setActiveChat] = useState(0);
  const [chatMode, setChatMode] = useState<
    "chat" | "improve" | "translate" | "replyEmail"
  >("chat");
  const messagesRef = useRef<HTMLDivElement>(null);
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [showCopied, setShowCopied] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [originalEmail, setOriginalEmail] = useState("");
  //for reply email use
  const [replySummary, setReplySummary] = useState("");
  const [replyTone, setReplyTone] = useState<
    "formal" | "friendly" | "angry" | "short"
  >("formal");
  const [generatedReply, setGeneratedReply] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768; // Open by default on desktop, closed on mobile
    }
    return true; // fallback SSR
  });

  const getSystemPrompt = () => {
    switch (chatMode) {
      case "improve":
        return "You are a writing assistant. The user's message will always be inside quotation marks. Rewrite only the quoted text to be clearer, more concise, and professional, but reply without that quotation mark. Do not add anything beyond the improved version of the quote. Never answer or respond — only rewrite.";
      case "translate":
        return "You are a bilingual translator. The user's message will always be in quotation marks. Translate the quoted text between English and Traditional Chinese, depending on the language. Return only the translated version without that quotation mark. Do not explain or reply — only translate.";
      case "replyEmail":
        return "You are a bilingual translator. The user's message will always be in quotation marks. Translate the quoted text between English and Traditional Chinese, depending on the language. Return only the translated version without that quotation mark. Do not explain or reply — only translate.";
      default:
        return "You are a helpful and friendly AI assistant.";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "ai", text: "Thinking..." } as Message,
    ]);

    try {
      const importantMessages = messages
        .filter((msg) => msg.role === "user" || msg.role === "ai")
        .slice(-8); // last 4 user+ai = 8 messages total

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: chatMode === "chat" ? input : `"${input}"`,
          systemPrompt: getSystemPrompt(),
          history: importantMessages,
        }),
      });

      const data = await res.json();

      const aiReply: Message = {
        role: "ai",
        text: data.reply || "No response from GPT-4o-mini.",
      };

      setMessages((prev) => [...prev.slice(0, -1), aiReply]);

      const userId = session?.user?.id || "anonymous";
      const sessionId = `session-${activeChat}`;

      await saveMessage({
        userId,
        message: input,
        response: data.reply || "",
        sessionId,
      });
    } catch {
      const errorReply: Message = {
        role: "ai",
        text: "Error connecting to GPT-4o-mini.",
      };
      setMessages((prev) => [...prev.slice(0, -1), errorReply]);
    }
  };

  const handleNewChat = () => {
    const newTitle = `Chat ${chatSessions.length + 1}`;
    setChatSessions([...chatSessions, newTitle]);
    setMessages([]);
    setActiveChat(chatSessions.length);

    const userId = session?.user?.id;
    const sessionId = `session-${chatSessions.length}`;

    if (userId) {
      setDoc(
        doc(db, "users", userId, "chats", sessionId),
        {
          title: newTitle,
        },
        { merge: true }
      );
    }
  };

  const handleDeleteChat = async (index: number) => {
    const userId = session?.user?.id;
    if (!userId) return;

    const sessionId = `session-${index}`;
    const messagesRef = collection(
      db,
      "users",
      userId,
      "chats",
      sessionId,
      "messages"
    );
    const snapshot = await getDocs(messagesRef);
    const deletions = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletions);
    await deleteDoc(doc(db, "users", userId, "chats", sessionId));

    const updatedChats = [...chatSessions];
    updatedChats.splice(index, 1);
    setChatSessions(updatedChats);

    if (index === activeChat) {
      setMessages([]);
      setActiveChat(0);
    } else if (index < activeChat) {
      setActiveChat((prev) => prev - 1);
    }
  };

  const generateReplyEmail = async () => {
    const res = await fetch("/api/generate-reply-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalEmail,
        replySummary,
        tone: replyTone,
      }),
    });

    const data = await res.json();
    return data.reply || "No response from the server.";
  };
  const handleGenerateEmail = async () => {
    const result = await generateReplyEmail();
    console.log("Generated reply:", result); // <- DEBUG
    setGeneratedReply(result);
  };

  useEffect(() => {
    const fetchTitles = async () => {
      const userId = session?.user?.id;
      if (!userId) return;

      const snapshot = await getDocs(collection(db, "users", userId, "chats"));
      const titles: string[] = [];

      snapshot.forEach((doc) => {
        titles.push(doc.data().title || "Untitled Chat");
      });

      setChatSessions(titles);
    };

    fetchTitles();
  }, [session]);

  useEffect(() => {
    const fetchMessages = async () => {
      const userId = session?.user?.id;
      if (!userId || chatSessions.length === 0) return;

      const sessionId = `session-${activeChat}`;
      const history = await loadMessages(userId, sessionId);
      setMessages(history);
    };

    if (session && chatSessions.length > 0) {
      fetchMessages();
    }
  }, [session, activeChat, chatSessions.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setTimeout(() => {
        if (
          sidebarRef.current &&
          !sidebarRef.current.contains(e.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(e.target as Node)
        ) {
          setIsSidebarOpen(false);
          setMenuOpenIndex(null);
        }
      }, 0);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  //this code is to fix the empty space below the input bar*/
  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight;
      console.log("New height:", vh);
    };

    updateHeight();
    setTimeout(updateHeight, 500);

    window.addEventListener("resize", updateHeight);
    window.addEventListener("load", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("load", updateHeight);
    };
  }, []);

  //this code is to make the floating button fade in and out*/
  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;
      setShowScrollButton(!isAtBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

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
      <div className="sticky top-0 z-30 w-full bg-white border-b border-zinc-200 shadow-sm">
        <div className="h-14 flex items-center px-4 justify-between">
          <button
            ref={buttonRef}
            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-zinc-100 transition rounded-md shadow-sm border border-zinc-200"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            <span className="text-xl">☰</span>
          </button>
          {/* Optional: App title or logo */}
          {/* <h1 className="text-lg font-semibold text-zinc-700">BunChat</h1> */}
          <div className="w-10 h-10" />{" "}
          {/* Placeholder to balance layout if needed */}
        </div>
      </div>

      {/* Main content: sidebar + chat area */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}

        <div
          id="chat-library"
          ref={sidebarRef}
          className={`
    fixed top-0 left-0 h-full w-64 bg-white border-r border-zinc-200 p-4 overflow-y-auto 
    z-50 shadow-lg transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-64"}
  `}
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
                        setChatSessions((prev) => {
                          const copy = [...prev];
                          copy[index] = newTitle;
                          return copy;
                        });
                      }}
                      onBlur={() => {
                        const userId = session?.user?.id;
                        if (userId) {
                          const sessionId = `session-${index}`;
                          setDoc(
                            doc(db, "users", userId, "chats", sessionId),
                            {
                              title: chatSessions[index],
                            },
                            { merge: true }
                          );
                        }
                        setRenamingIndex(null);
                      }}
                      className="bg-white border border-zinc-300 px-2 py-1 rounded text-sm w-full shadow-sm"
                    />
                  ) : (
                    <span className="text-sm truncate">
                      {chatSessions[index]}
                    </span>
                  )}

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenIndex(
                          menuOpenIndex === index ? null : index
                        );
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

        {/* chat-container(include chat window+radio selector+input section) */}
        <main className="flex flex-col w-full transition-all duration-300 ease-in-out overflow-y-auto pt-[10px] pb-[160px]">
          {/* chat-messages */}
          <div
            className="flex flex-col flex-1 transition-all duration-300 ease-in-out overflow-y-auto"
            ref={messagesRef}
          >
            {chatMode === "replyEmail" && (
              <div className="space-y-6 max-w-3xl mx-auto">
                {/* Original Email Input */}
                <div className="flex gap-3">
                  <textarea
                    placeholder="Paste the email you want to reply to"
                    className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={originalEmail}
                    onChange={(e) => setOriginalEmail(e.target.value)}
                  />
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
                    onClick={async () => {
                      const text = await navigator.clipboard.readText();
                      setOriginalEmail(text);
                    }}
                  >
                    Paste
                  </button>
                </div>

                {/* Summary Input */}
                <textarea
                  placeholder="Summarize what you want to say"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={replySummary}
                  onChange={(e) => setReplySummary(e.target.value)}
                />

                {/* Tone Selector */}
                <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
                  {["formal", "friendly", "angry", "short"].map((tone) => (
                    <label key={tone} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="tone"
                        value={tone}
                        checked={replyTone === tone}
                        onChange={() => setReplyTone(tone as typeof replyTone)}
                        className="accent-blue-600"
                      />
                      {tone === "short"
                        ? "Short & Simple"
                        : tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </label>
                  ))}
                </div>

                {/* Generate Button */}
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition"
                  onClick={handleGenerateEmail}
                >
                  Generate Reply
                </button>

                {/* Output Box */}
                <div
                  className="p-4 rounded-lg bg-yellow-50 text-yellow-900 border border-yellow-200 shadow-inner cursor-pointer whitespace-pre-line hover:ring-2 ring-yellow-300 transition"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedReply);
                    setShowCopied(true);
                    setTimeout(() => setShowCopied(false), 1500);
                  }}
                >
                  {generatedReply || "Generated email will appear here."}
                </div>
              </div>
            )}

            {chatMode !== "replyEmail" &&
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`w-full flex mb-4 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`message inline-block px-4 py-3 rounded-xl max-w-[80%] whitespace-pre-line shadow-md transition-all duration-200 ${
                      msg.role === "user"
                        ? "bg-blue-100 text-blue-900 rounded-br-none hover:ring-2 ring-blue-300"
                        : "bg-gray-100 text-gray-800 rounded-bl-none hover:ring-2 ring-gray-300"
                    }`}
                    onClick={() => {
                      navigator.clipboard.writeText(msg.text);
                      setShowCopied(true);
                      setTimeout(() => setShowCopied(false), 1500);
                    }}
                    title="Click to copy"
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

            {showCopied && (
              <div className="fixed left-1/2 -translate-x-1/2 bottom-28 bg-black text-white text-xs px-3 py-1 rounded shadow-lg z-50 animate-fadeIn">
                Copied!
              </div>
            )}
          </div>

          {/* floating scroll button */}
          <button
            onClick={() =>
              messagesRef.current?.scrollTo({
                top: messagesRef.current.scrollHeight,
                behavior: "smooth",
              })
            }
            className={`fixed bottom-50 right-5 z-40 bg-white border border-gray-300 shadow-lg p-3 rounded-full transition-opacity duration-300 ease-in-out
    ${showScrollButton ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            title="Scroll to bottom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* bottom sticky section */}
          <div
            className="bg-white border-t z-30"
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {/* input-area */}
            <div
              className={`input-area flex items-end gap-3 p-4 bg-white border-t border-zinc-200 shadow-inner transition-all duration-300 ${
                isSidebarOpen ? "md:pl-64" : "md:pl-0"
              }`}
            >
              <textarea
                id="user-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 resize-none min-h-[3.5rem] max-h-40 px-4 py-2 text-sm rounded-lg border border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              ></textarea>
              <button
                id="send-button"
                className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-md ${
                  input.trim()
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-300 cursor-not-allowed"
                }`}
                onClick={handleSend}
                disabled={!input.trim()}
              >
                Send
              </button>
            </div>
            {/* mode-selector */}
            <div
              id="mode-selector"
              className={`flex justify-around items-center px-4 py-2 border-t border-gray-200 bg-white shadow-sm transition-all duration-300 ${
                isSidebarOpen ? "md:pl-64" : "md:pl-0"
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
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm transition ${
                    chatMode === mode.value
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
        </main>
      </main>
    </div>
  );
}
