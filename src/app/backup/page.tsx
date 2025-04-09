"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Welcome to My AI Chatbot</h1>
          <p className="mb-6 text-gray-600">Please sign in to continue</p>
          <button
            onClick={() => signIn("google")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Sign in with Google
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="p-4">
      <p>Welcome, {session.user?.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </main>
  )
}
