import { db } from "./firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export const saveMessage = async (userId: string, message: string, response: string) => {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      userId,
      message,
      response,
      createdAt: serverTimestamp(),
    })
    console.log("Message saved:", docRef.id)
  } catch (error) {
    console.error("Error saving message:", error)
  }
}
