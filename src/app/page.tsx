// page.tsx
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
  const [chatMode, setChatMode] = useState<"chat" | "improve" | "translate" | "replyEmail">("chat")
  const messagesRef = useRef<HTMLDivElement>(null)
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null)
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null)
  const [showCopied, setShowCopied] = useState(false)
  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [originalEmail, setOriginalEmail] = useState("")

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768 // Open by default on desktop, closed on mobile
    }
    return true // fallback SSR
  })




  const getSystemPrompt = () => {
    switch (chatMode) {
      case "improve":
        return "You are a writing assistant. The user's message will always be inside quotation marks. Rewrite only the quoted text to be clearer, more concise, and professional, but reply without that quotation mark. Do not add anything beyond the improved version of the quote. Never answer or respond — only rewrite."
      case "translate":
        return "You are a bilingual translator. The user's message will always be in quotation marks. Translate the quoted text between English and Traditional Chinese, depending on the language. Return only the translated version without that quotation mark. Do not explain or reply — only translate."
      case "replyEmail":
        return "You are a bilingual translator. The user's message will always be in quotation marks. Translate the quoted text between English and Traditional Chinese, depending on the language. Return only the translated version without that quotation mark. Do not explain or reply — only translate."
      default:
        return "You are a helpful and friendly AI assistant."
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    setMessages((prev) => [...prev, { role: "ai", text: "Thinking..." } as Message])

    try {
      const importantMessages = messages
        .filter((msg) => msg.role === "user" || msg.role === "ai")
        .slice(-8) // last 4 user+ai = 8 messages total

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: chatMode === "chat" ? input : `"${input}"`,
          systemPrompt: getSystemPrompt(),
          history: importantMessages,
        }),
      })

      const data = await res.json()

      const aiReply: Message = {
        role: "ai",
        text: data.reply || "No response from GPT-4o-mini.",
      }

      setMessages((prev) => [...prev.slice(0, -1), aiReply])

      const userId = session?.user?.id || "anonymous"
      const sessionId = `session-${activeChat}`

      await saveMessage({ userId, message: input, response: data.reply || "", sessionId })
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
  }, [session, activeChat, chatSessions.length])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setTimeout(() => {
        if (
          sidebarRef.current &&
          !sidebarRef.current.contains(e.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(e.target as Node)
        ) {
          setIsSidebarOpen(false)
          setMenuOpenIndex(null)
        }

      }, 0)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [])


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
    <div className="app-layout flex flex-col md:flex-row h-screen">



      <div className="w-full flex items-center justify-between px-4 py-2 border-b bg-white z-30 fixed top-0 left-0 right-0 h-14 md:h-16">
        {/* Hamburger */}
        <button
          ref={buttonRef}
          className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-100 transition rounded shadow z-50"
          onClick={() => setIsSidebarOpen(prev => !prev)}
        >
          <span className="text-xl">☰</span>
        </button>






        <h1 className="text-lg font-semibold">BunChat</h1>

        {/* User avatar or settings can go here later */}
        <div className="w-8 h-8 rounded-full bg-gray-300" />
      </div>


      <div
        id="chat-library" ref={sidebarRef}
        className={`bg-white border-r p-4 transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed md:relative md:translate-x-0 md:w-64 w-3/4 h-full z-40 top-14 md:top-0`}
      >
        <h2>BunChat</h2>
        <button id="new-chat-button" onClick={handleNewChat}>
          New Chat +
        </button>
        <ul id="chat-list">
          {chatSessions.map((title, index) => (
            <li
              key={index}
              className={index === activeChat ? "active-chat" : ""}
              onClick={async () => {
                if (menuOpenIndex !== null) return
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
                      className="absolute right-0 top-full mt-1 w-40 bg-white border rounded shadow text-sm z-10"
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

      <div className="chat-container relative flex flex-col flex-1 max-h-screen overflow-hidden">



        <div className="pt-14 md:pt-16 flex-1 overflow-y-auto">
          <div
            id="chat-messages"
            ref={messagesRef}
            className="p-4 pb-60 space-y-2"
          >


            {chatMode === "replyEmail" && (
              <div className="space-y-4 p-4">
                <div className="flex gap-2">
                  <textarea
                    placeholder="Paste the email you want to reply to"
                    className="w-full p-2 border rounded"
                    value={originalEmail}
                    onChange={(e) => setOriginalEmail(e.target.value)}
                  />
                  <button
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={async () => {
                      const text = await navigator.clipboard.readText()
                      setOriginalEmail(text)
                    }}
                  >
                    Paste
                  </button>
                </div>

                <textarea placeholder="Summarize what you want to say" className="w-full p-2 border rounded" />
                <div className="flex gap-4">
                  <label><input type="radio" name="tone" value="formal" /> Formal</label>
                  <label><input type="radio" name="tone" value="friendly" /> Friendly</label>
                  <label><input type="radio" name="tone" value="friendly" /> Angry</label>
                </div>
                <div
                  className="p-4 bg-gray-100 border rounded cursor-pointer hover:bg-gray-200"
                  onClick={() => {
                    navigator.clipboard.writeText("Generated email text...")
                    setShowCopied(true)
                    setTimeout(() => setShowCopied(false), 1500)
                  }}
                >
                  Generated email will appear here.
                </div>
              </div>
            )}

            {chatMode !== "replyEmail" &&
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`message ${msg.role === "user" ? "user-message" : "bot-message"} hover:bg-gray-100 cursor-pointer transition`}
                  onClick={() => {
                    navigator.clipboard.writeText(msg.text)
                    setShowCopied(true)
                    setTimeout(() => setShowCopied(false), 1500)
                  }}
                  title="Click to copy"
                >
                  {msg.text}
                </div>
              ))
            }


            {showCopied && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-28 bg-black text-white text-xs px-3 py-1 rounded shadow z-50">
                Copied!
              </div>
            )}
          </div>


        </div>

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
          <div id="mode-selector" className="p-2 flex justify-around border-b text-sm">
            <label>
              <input
                type="radio"
                name="chat-mode"
                value="chat"
                checked={chatMode === "chat"}
                onChange={() => setChatMode("chat")}
              /> Chat
            </label>
            <label>
              <input
                type="radio"
                name="chat-mode"
                value="improve"
                checked={chatMode === "improve"}
                onChange={() => setChatMode("improve")}
              /> Improve
            </label>
            <label>
              <input
                type="radio"
                name="chat-mode"
                value="translate"
                checked={chatMode === "translate"}
                onChange={() => setChatMode("translate")}
              /> Translate
            </label>
            <label>
              <input
                type="radio"
                name="chat-mode"
                value="replyEmail"
                checked={chatMode === "replyEmail"}
                onChange={() => setChatMode("replyEmail")}
              /> Reply Email
            </label>
          </div>


          <div className="input-area flex items-center gap-2 p-4">
            <textarea
              id="user-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type your message..."
              className="flex-1 resize-none h-16 px-3 py-2 border rounded"
            ></textarea>
            <button
              id="send-button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              Send
            </button>
          </div>
        </div>



      </div>
    </div>
  )
}

