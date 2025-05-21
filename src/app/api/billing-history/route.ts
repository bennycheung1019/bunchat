import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config"; // Your existing auth config
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const snapshot = await db
            .collection("billingHistory")
            .where("userId", "==", session.user.id)
            .orderBy("date", "desc")
            .get();

        const data = snapshot.docs.map((doc) => {
            const entry = doc.data();
            return {
                id: doc.id,
                tokens: entry.tokens,
                amount: entry.amount,
                date: entry.date instanceof Timestamp
                    ? entry.date.toDate().toISOString().split("T")[0]
                    : entry.date, // fallback if stored as string
            };
        });

        return NextResponse.json(data);
    } catch (err) {
        console.error("🔥 Firestore error:", err);
        return NextResponse.json({ error: "Failed to load billing history." }, { status: 500 });
    }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(_req: NextRequest) {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const snapshot = await db
            .collection("billingHistory")
            .where("userId", "==", session.user.id)
            .orderBy("date", "desc")
            .get();

        const data = snapshot.docs.map((doc) => {
            const entry = doc.data();
            const date = entry.date instanceof Timestamp
                ? entry.date.toDate().toISOString().split("T")[0]
                : typeof entry.date === "string"
                    ? entry.date
                    : "";

            return {
                id: doc.id,
                tokens: entry.tokens ?? 0,
                amount: entry.amount ?? "",
                date,
            };
        });

        return NextResponse.json(data);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("🔥 Firestore error:", message);
        return NextResponse.json({ error: "Failed to load billing history." }, { status: 500 });
    }
}
