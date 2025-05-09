// ✅ File: /src/app/api/create-payment-intent/route.ts

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { amount, currency = "USD" } = body;

    const key = process.env.AIRWALLEX_API_KEY;
    if (!key) {
        return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    try {
        const response = await axios.post(
            "https://api.airwallex.com/api/v1/pa/payment_intents/create",
            {
                request_id: `order_${Date.now()}`,
                amount,
                currency,
                merchant_order_id: `merchant_order_${Date.now()}`,
                return_url: "https://yourdomain.com/purchase-success" // ✅ Update this to your actual success page
            },
            {
                headers: {
                    Authorization: `Bearer ${key}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return NextResponse.json({
            id: response.data.id,
            client_secret: response.data.client_secret,
            next_action: response.data.next_action,
        });
    } catch (err: unknown) {
        const error = err as { response?: { data?: unknown }; message?: string };
        console.error("❌ Airwallex API error:", error.response?.data || error.message || error);
        return NextResponse.json({ error: "Failed to create PaymentIntent" }, { status: 500 });
    }
}