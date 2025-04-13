"use client";

import { useEffect, useRef, useState } from "react";
import { loadMessages } from "@/lib/loadMessages";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

// 👇 Define Message type locally
interface Message {
  role: "user" | "ai";
  text: string;
}

export default function ChatConversation() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

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

  const handleSend = async () => {
    if (!input.trim() || !session?.user?.id) return;

    const userId = session.user.id;
    const sessionId = "session-0";
    const chatRef = collection(
      db,
      "users",
      userId,
      "chats",
      sessionId,
      "messages"
    );

    const userMessage: Message = { role: "user", text: input };
    const tempAiMessage: Message = { role: "ai", text: "Thinking..." };
    setMessages((prev) => [...prev, userMessage, tempAiMessage]);
    setInput("");

    try {
      const recentMessages = messages.slice(-6); // Last few messages to keep prompt short
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          systemPrompt: "You are a helpful assistant.",
          history: recentMessages,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        role: "ai",
        text: data.reply || "No response from GPT-4o-mini.",
      };

      await addDoc(chatRef, userMessage);
      await addDoc(chatRef, aiMessage);

      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove "Thinking..."
        aiMessage,
      ]);
    } catch (err) {
      console.error("GPT Error:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "ai", text: "Error talking to GPT-4o-mini." },
      ]);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Scrollable message area */}
      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 border border-red-500 h-0"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`w-full flex mb-4 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`inline-block px-4 py-3 rounded-xl max-w-[80%] whitespace-pre-line shadow-md cursor-pointer ${
                msg.role === "user"
                  ? "bg-blue-100 text-blue-900 hover:ring-2 ring-blue-300"
                  : "bg-gray-100 text-gray-800 hover:ring-2 ring-gray-300"
              }`}
              title="Click to copy"
              onClick={() => navigator.clipboard.writeText(msg.text)}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-[10px] bg-white border-t px-4 py-3 z-10">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 resize-none min-h-[3rem] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`ml-3 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all duration-200 shadow-md ${
              input.trim()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
