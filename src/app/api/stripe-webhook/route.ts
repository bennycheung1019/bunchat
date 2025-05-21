// ✅ File: /src/app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase-admin";

export const config = {
    api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest) {
    const sig = req.headers.get("stripe-signature");

    if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

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
        console.error("❌ Webhook signature error:", err);
        return NextResponse.json({ error: "Webhook error" }, { status: 400 });
    }

    if (event.type === "payment_intent.succeeded") {
        const intent = event.data.object as Stripe.PaymentIntent;
        const customerId = intent.metadata?.customerId;
        const tokens = parseInt(intent.metadata?.tokens || "0");

        console.log("📦 Webhook received:", {
            customerId,
            tokens,
            amount: intent.amount,
        });

        if (!customerId || !tokens) {
            console.warn("⚠️ Missing metadata in webhook.");
            return NextResponse.json({ received: true });
        }

        try {
            const userRef = db.collection("users").doc(customerId);
            const userSnap = await userRef.get();
            const current = userSnap.exists ? userSnap.data()?.tokens || 0 : 0;

            await userRef.set({ tokens: current + tokens }, { merge: true });
            console.log("✅ User token balance updated.");

            await db.collection("billingHistory").add({
                userId: customerId,
                tokens,
                amount: `USD$${(intent.amount / 100).toFixed(2)}`,
                date: new Date(),
            });

            console.log("✅ Billing history written to Firestore.");
        } catch (err) {
            console.error("❌ Error writing to Firestore:", err);
        }
    }


    return NextResponse.json({ received: true });
}
