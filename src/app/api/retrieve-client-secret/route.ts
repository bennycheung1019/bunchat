import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil", // Match your installed Stripe version
});

export async function GET(req: NextRequest) {
    const intentId = req.nextUrl.searchParams.get("payment_intent");

    if (!intentId) {
        return NextResponse.json({ error: "Missing payment_intent" }, { status: 400 });
    }

    try {
        const intent = await stripe.paymentIntents.retrieve(intentId);
        return NextResponse.json({ client_secret: intent.client_secret });
    } catch (err) {
        console.error("Stripe retrieve error:", err);
        return NextResponse.json({ error: "Failed to retrieve client_secret" }, { status: 500 });
    }
}
