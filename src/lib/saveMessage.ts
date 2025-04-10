import { db } from "./firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function saveMessage({
  userId,
  message,
  response,
  sessionId,
}: {
  userId: string
  message: string
  response: string
  sessionId: string
}) {
  try {
    await addDoc(collection(db, "users", userId, "chats", sessionId, "messages"), {
      message,
      response,
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Failed to save message to Firestore:", error)
  }
}
