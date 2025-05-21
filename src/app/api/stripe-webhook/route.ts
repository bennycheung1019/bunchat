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
    console.log("🟢 Stripe webhook hit");

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
        console.error("❌ Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "payment_intent.succeeded") {
        const intent = event.data.object as Stripe.PaymentIntent;
        const customerId = intent.metadata?.customerId;
        const tokensRaw = intent.metadata?.tokens;
        const tokens = Number(tokensRaw);
        const amount = (intent.amount / 100).toFixed(2);

        console.log("📦 Stripe Metadata:", { customerId, tokensRaw, tokens });

        if (!customerId || isNaN(tokens) || tokens <= 0) {
            console.warn("⚠️ Invalid or missing metadata:", { customerId, tokensRaw });
            return NextResponse.json({ received: true });
        }

        try {
            // ✅ Update user token balance
            const userRef = db.collection("users").doc(customerId);
            const userSnap = await userRef.get();
            const current = userSnap.exists ? userSnap.data()?.tokens || 0 : 0;

            await userRef.set({ tokens: current + tokens }, { merge: true });
            console.log(`✅ Token balance updated: ${current} → ${current + tokens}`);

            // ✅ Write billing history
            await db.collection("billingHistory").add({
                userId: customerId,
                tokens,
                amount: `USD$${amount}`,
                date: new Date(),
            });
            console.log("✅ billingHistory record written");
        } catch (err) {
            console.error("❌ Firestore write failed:", err);
        }
    }

    return NextResponse.json({ received: true });
}
