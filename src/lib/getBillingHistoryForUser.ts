import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";

// Only initialize once
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

const db = getFirestore();

export async function getBillingHistoryForUser(userId: string) {
    const snapshot = await db
        .collection("billingHistory")
        .where("userId", "==", userId)
        .orderBy("date", "desc")
        .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
