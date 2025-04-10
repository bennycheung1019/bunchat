"use client"

import { signIn, useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { saveMessage } from "@/lib/saveMessage"
import { loadMessages } from "@/lib/loadMessages"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"


import "@/app/globals.css"

interface Message {
  role: "user" | "ai"
  text: string
}

export default function Home() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [chatSessions, setChatSessions] = useState<string[]>(["Chat 1"])
  const [activeChat, setActiveChat] = useState(0)
  const messagesRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Add 'Thinking...' placeholder
    setMessages((prev) => [...prev, { role: "ai", text: "Thinking..." } as Message])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })

      const data = await res.json()

      const aiReply: Message = {
        role: "ai",
        text: data.reply || "No response from GPT-4o-mini.",
      }

      setMessages((prev) => [...prev.slice(0, -1), aiReply])

      // 🔥 Save to Firestore
      const userId = session?.user?.id || "anonymous"
      const sessionId = `session-${activeChat}`

      await saveMessage({
        userId,
        message: input,
        response: data.reply || "",
        sessionId,
      })

    } catch {
      const errorReply: Message = {
        role: "ai",
        text: "Error connecting to GPT-4o-mini.",
      }
      setMessages((prev) => [...prev.slice(0, -1), errorReply])
    }
  }


  const handleNewChat = () => {
    const newTitle = `Chat ${chatSessions.length + 1}`
    setChatSessions([...chatSessions, newTitle])
    setMessages([])
    setActiveChat(chatSessions.length)

    const userId = session?.user?.id
    const sessionId = `session-${chatSessions.length}`

    if (userId) {
      setDoc(doc(db, "users", userId, "chats", sessionId), {
        title: newTitle
      }, { merge: true })
    }
  }


  const scrollToBottom = () => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    const fetchTitles = async () => {
      const userId = session?.user?.id
      if (!userId) return

      const snapshot = await getDocs(collection(db, "users", userId, "chats"))
      const titles: string[] = []

      snapshot.forEach((doc) => {
        titles.push(doc.data().title || "Untitled Chat")
      })

      setChatSessions(titles)
    }

    fetchTitles()
  }, [session])

  if (!session) {
    return (
      <main className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
        <h1 className="text-2xl font-semibold mb-4">Welcome to the AI Chatbot</h1>
        <p className="mb-6 text-gray-600">Sign in with Google to start chatting</p>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </main>
    )
  }

  return (
    <div className="app-layout">
      <div id="chat-library">
        <h2>Chat Library</h2>
        <button id="new-chat-button" onClick={handleNewChat}>
          New Chat +
        </button>
        <ul id="chat-list">
          {chatSessions.map((title, index) => (
            <li key={index} className={index === activeChat ? "active-chat" : ""}>
              <input
                value={chatSessions[index]}
                onChange={(e) => {
                  const newTitle = e.target.value
                  setChatSessions((prev) => {
                    const copy = [...prev]
                    copy[index] = newTitle
                    return copy
                  })
                  // Optional: Save new title to Firestore
                  const userId = session?.user?.id
                  if (userId) {
                    const sessionId = `session-${index}`
                    setDoc(doc(db, "users", userId, "chats", sessionId), {
                      title: newTitle
                    }, { merge: true })
                  }
                }}
                className="bg-transparent border-none focus:outline-none text-sm"
              />
            </li>

          ))}
        </ul>
        <div className="ai-profile">
          <img src="/cat.jpg" alt="AI Profile Picture" />
        </div>
      </div>

      <div className="chat-container">
        <div id="mode-selector">
          <label>
            <input type="radio" name="chat-mode" value="chat" defaultChecked /> Chat
          </label>
          <label>
            <input type="radio" name="chat-mode" value="improve" /> Improve Writing
          </label>
          <label>
            <input type="radio" name="chat-mode" value="translate" /> English ↔ 中文 (Trad)
          </label>
        </div>

        <div id="chat-messages" ref={messagesRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.role === "user" ? "user-message" : "bot-message"}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            id="user-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button id="send-button" onClick={handleSend} disabled={!input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
