import { db } from "./firebase"
import { collection, getDocs, orderBy, query } from "firebase/firestore"

export async function loadMessages(userId: string, sessionId: string) {
  const messagesRef = collection(db, "users", userId, "chats", sessionId, "messages")
  const q = query(messagesRef, orderBy("createdAt", "asc"))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return [
      { role: "user", text: data.message },
      { role: "ai", text: data.response },
    ]
  }).flat() // Flatten so messages are ordered in 1 array
}
