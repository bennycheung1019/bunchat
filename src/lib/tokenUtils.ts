import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase"; // your firebase auth setup

const db = getFirestore();

export async function getUserTokens(userId: string) {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data().tokens || 0 : 0;
}

export async function deductTokens(userId: string, amount: number) {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) throw new Error("User not found");

    const currentTokens = docSnap.data().tokens || 0;
    if (currentTokens < amount) throw new Error("Not enough tokens");

    await updateDoc(userRef, { tokens: currentTokens - amount });
}
