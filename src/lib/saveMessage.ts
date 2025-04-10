import { db } from "./firebase"
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore"

export async function saveMessage({
  userId,
  message,
  response,
  sessionId,
  title = "Untitled Chat"
}: {
  userId: string
  message: string
  response: string
  sessionId: string
  title?: string
}) {
  try {
    const sessionRef = doc(db, "users", userId, "chats", sessionId)

    // Save title only if not already set
    const sessionSnap = await getDoc(sessionRef)
    if (!sessionSnap.exists()) {
      await setDoc(sessionRef, {
        title,
        createdAt: serverTimestamp()
      })
    }

    // Save message
    await addDoc(collection(sessionRef, "messages"), {
      message,
      response,
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Failed to save message to Firestore:", error)
  }
}
