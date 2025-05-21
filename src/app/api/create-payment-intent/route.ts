// /src/app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { amount = 500, currency = "usd", customerId } = body;

    if (!customerId) {
        return NextResponse.json({ error: "Missing customer ID" }, { status: 400 });
    }

    const tokens = amountToTokens(amount);

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: {
                customerId,
                tokens, // send as number
            },
        });

        console.log("🎯 Created PaymentIntent:", {
            customerId,
            amount,
            tokens,
            intentId: paymentIntent.id,
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            intentId: paymentIntent.id,
        });
    } catch (err) {
        console.error("❌ Stripe error:", err);
        return NextResponse.json({ error: "Failed to create PaymentIntent" }, { status: 500 });
    }
}

function amountToTokens(amount: number) {
    if (amount === 500) return 50;
    if (amount === 1000) return 120;
    if (amount === 2000) return 300;
    return 0;
}
