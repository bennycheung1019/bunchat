import { db } from "./firebase"
import { collection, getDocs, orderBy, query } from "firebase/firestore"

export async function loadMessages(userId: string, sessionId: string) {
  const messagesRef = collection(db, "users", userId, "chats", sessionId, "messages")
  const q = query(messagesRef, orderBy("createdAt", "asc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.flatMap((doc) => {
    const data = doc.data()
    return [
      { role: "user" as const, text: data.message },
      { role: "ai" as const, text: data.response },
    ]
  }) 
}