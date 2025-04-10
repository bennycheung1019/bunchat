"use client"

import { signIn, useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { saveMessage } from "@/lib/saveMessage"
import { loadMessages } from "@/lib/loadMessages"
import { db } from "@/lib/firebase"
import {
  deleteDoc,
  collection,
  getDocs,
  doc,
  setDoc
} from "firebase/firestore"

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
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null)
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

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

  const handleDeleteChat = async (index: number) => {
    const userId = session?.user?.id
    if (!userId) return

    const sessionId = `session-${index}`
    const messagesRef = collection(db, "users", userId, "chats", sessionId, "messages")
    const snapshot = await getDocs(messagesRef)
    const deletions = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref))
    await Promise.all(deletions)
    await deleteDoc(doc(db, "users", userId, "chats", sessionId))

    const updatedChats = [...chatSessions]
    updatedChats.splice(index, 1)
    setChatSessions(updatedChats)

    if (index === activeChat) {
      setMessages([])
      setActiveChat(0)
    } else if (index < activeChat) {
      setActiveChat((prev) => prev - 1)
    }
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

  useEffect(() => {
    const fetchMessages = async () => {
      const userId = session?.user?.id
      if (!userId || chatSessions.length === 0) return

      const sessionId = `session-${activeChat}`
      const history = await loadMessages(userId, sessionId)
      setMessages(history)
    }

    if (session && chatSessions.length > 0) {
      fetchMessages()
    }
  }, [session, activeChat])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenIndex(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 👇 your return() starts here
  return (
    <div className="app-layout">
      ...
    </div>
  )

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
            <li
              key={index}
              className={index === activeChat ? "active-chat" : ""}
              onClick={async () => {
                if (menuOpenIndex !== null) return // block if menu open
                setActiveChat(index)

                const userId = session?.user?.id
                const sessionId = `session-${index}`

                if (userId) {
                  const history = await loadMessages(userId, sessionId)
                  setMessages(history)
                } else {
                  setMessages([])
                }
              }}
            >
              <div className="flex items-center justify-between w-full">
                {renamingIndex === index ? (
                  <input
                    autoFocus
                    value={chatSessions[index]}
                    onChange={(e) => {
                      const newTitle = e.target.value
                      setChatSessions((prev) => {
                        const copy = [...prev]
                        copy[index] = newTitle
                        return copy
                      })
                    }}
                    onBlur={() => {
                      const userId = session?.user?.id
                      if (userId) {
                        const sessionId = `session-${index}`
                        setDoc(doc(db, "users", userId, "chats", sessionId), {
                          title: chatSessions[index]
                        }, { merge: true })
                      }
                      setRenamingIndex(null)
                    }}
                    className="bg-white px-1 border rounded text-sm w-full"
                  />
                ) : (
                  <span className="text-sm truncate">{chatSessions[index]}</span>
                )}

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpenIndex(menuOpenIndex === index ? null : index)
                    }}
                    className="ml-2 text-gray-500 hover:text-black"
                  >
                    ⋯
                  </button>

                  {menuOpenIndex === index && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-full mt-1 bg-white border rounded shadow text-sm z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
                        onClick={() => {
                          setRenamingIndex(index)
                          setMenuOpenIndex(null)
                        }}
                      >
                        Rename
                      </button>
                      <button
                        className="block w-full px-4 py-2 hover:bg-red-100 text-left text-red-600"
                        onClick={() => {
                          handleDeleteChat(index)
                          setMenuOpenIndex(null)
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
