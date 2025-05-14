import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { buffer } from "micro";
import { getFirestore, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
});

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: NextRequest) {
    const sig = req.headers.get("stripe-signature") as string;

    let event;

    try {
        const rawBody = await req.arrayBuffer();
        const bodyBuffer = Buffer.from(rawBody);
        event = stripe.webhooks.constructEvent(
            bodyBuffer,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("❌ Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    // ✅ Handle only successful payments
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customerId = paymentIntent.metadata?.customerId;
        const tokens = parseInt(paymentIntent.metadata?.tokens || "0");

        if (!customerId || !tokens) {
            console.warn("⚠️ Missing customerId or tokens in metadata.");
            return NextResponse.json({ received: true });
        }

        try {
            const db = getFirestore(app);
            const userRef = doc(db, "users", customerId);
            const userSnap = await getDoc(userRef);
            const currentTokens = userSnap.exists() ? userSnap.data().tokens || 0 : 0;

            await setDoc(userRef, { tokens: currentTokens + tokens }, { merge: true });
            console.log(`✅ ${tokens} tokens added for user ${customerId}`);
        } catch (e) {
            console.error("❌ Firestore update failed:", e);
        }
    }

    return NextResponse.json({ received: true });
}
