"use client";

import { useEffect, useRef, useState } from "react";
import { saveMessage } from "@/lib/saveMessage";
import { loadMessages } from "@/lib/loadMessages";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { getUserTokens, deductTokens } from "@/lib/tokenUtils";
import { useTokenContext } from "@/context/TokenContext";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface ChatConversationProps {
  isSidebarOpen: boolean;
}

export default function ChatConversation({
  isSidebarOpen,
}: ChatConversationProps) {

  const { data: session } = useSession();
  const t = useTranslations("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const { refreshTokenBalance } = useTokenContext();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1500);
  };

  useEffect(() => {
    const fetch = async () => {
      if (!session?.user?.id) return;
      const history = await loadMessages(session.user.id, "session-0");
      setMessages(history);
    };
    fetch();
  }, [session]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

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
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [messagesRef]);

  useEffect(() => {
    const checkRef = () => {
      if (messagesRef.current) {
        const container = messagesRef.current;
        const isAtBottom =
          container.scrollHeight -
          container.scrollTop -
          container.clientHeight <
          100;
        setShowScrollButton(!isAtBottom);
      }
    };

    const timeout = setTimeout(checkRef, 100);
    return () => clearTimeout(timeout);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !session?.user?.id) return;

    const userId = session.user.id;
    const sessionId = "session-0";
    const userMessage: Message = { role: "user", text: input };
    const placeholder: Message = { role: "ai", text: t("thinking") };


    // 💥  Check and deduct tokens
    const tokens = await getUserTokens(session.user.id);
    if (tokens < 5) {  // Example: Chat costs 5 tokens
      alert("Not enough tokens. Please purchase more.");
      return;
    }

    setMessages((prev) => [...prev, userMessage, placeholder]);
    setInput("");

    try {
      const recentMessages = messages
        .filter((msg) => msg.role === "user" || msg.role === "ai")
        .slice(-6);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          systemPrompt: "You are a helpful assistant.",
          history: recentMessages,
        }),
      });

      const data = await res.json();
      const aiMessage: Message = {
        role: "ai",
        text: data.reply || t("noReply"),
      };

      setMessages((prev) => [...prev.slice(0, -1), aiMessage]);

      await saveMessage({
        userId,
        sessionId,
        message: input,
        response: data.reply,
        title: "Single Session",
      });

      if (data.reply) {
        await deductTokens(userId, 5);         // ✅ Only deduct if reply is good
        await refreshTokenBalance();           // ✅ Then update the balance
      }
    } catch (err) {
      console.error("GPT Error:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: t("error") },
      ]);
    }

  };

  return (
    <div className="flex-1 overflow-hidden relative">
      <div
        ref={messagesRef}
        className="absolute inset-0 overflow-y-auto px-4 py-6 space-y-4"
        style={{ paddingBottom: "160px" }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`w-full flex  ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              onClick={() => handleCopy(msg.text)}
              className={`inline-block px-4 py-3 rounded-xl max-w-[80%] whitespace-pre-line shadow-md cursor-pointer ${msg.role === "user"
                ? "bg-blue-100 text-blue-900 hover:ring-2 ring-blue-300"
                : "bg-gray-100 text-gray-800 hover:ring-2 ring-gray-300"}`}
              title={t("clickToCopy")}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {showCopied && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-45 bg-black text-white text-xs px-3 py-1 rounded shadow-lg z-50 animate-fadeIn">
          {t("copied")}
        </div>
      )}

      <button
        onClick={() =>
          messagesRef.current?.scrollTo({
            top: messagesRef.current.scrollHeight,
            behavior: "smooth",
          })
        }
        className={`fixed bottom-50 right-5 z-40 bg-white border border-gray-300 shadow-lg p-3 rounded-full transition-opacity duration-300 ease-in-out
    ${showScrollButton ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        title={t("scrollToBottom")}
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

      <div
        className={`bg-white z-30 fixed bottom-[76px] right-0 left-0 transition-all duration-300 ${isSidebarOpen ? "md:left-64" : "left-0"}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="input-area flex items-center gap-3 p-4 bg-white border-t border-zinc-200 shadow-inner">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t("placeholder")}
            className="flex-1 resize-none min-h-[3rem] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`ml-3 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all duration-200 shadow-md ${input.trim()
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"}`}
          >
            {t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}
