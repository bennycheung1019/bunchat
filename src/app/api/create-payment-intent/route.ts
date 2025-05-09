// ✅ File: /src/app/api/create-payment-intent/route.ts

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { amount, currency = "USD" } = body;

    const clientId = process.env.AIRWALLEX_CLIENT_ID;
    const apiKey = process.env.AIRWALLEX_API_KEY;

    if (!clientId || !apiKey) {
        return NextResponse.json({ error: "Missing Airwallex client credentials" }, { status: 500 });
    }

    console.log("🔐 AIRWALLEX_CLIENT_ID present:", !!clientId);
    console.log("🔐 AIRWALLEX_API_KEY present:", !!apiKey);

    try {
        // Step 1: Authenticate and get access token
        const authRes = await axios.post(
            "https://api.airwallex.com/api/v1/authentication/login",
            {},
            {
                headers: {
                    "x-client-id": clientId,
                    "x-api-key": apiKey,
                },
            }
        );

        const token = authRes.data.token;
        console.log("✅ Received access token (first 8 chars):", token.slice(0, 8));

        // Step 2: Create PaymentIntent for custom card form usage
        const intentRes = await axios.post(
            "https://api.airwallex.com/api/v1/pa/payment_intents/create",
            {
                request_id: `order_${Date.now()}`,
                merchant_order_id: `merchant_order_${Date.now()}`,
                currency,
                amount,
                payment_method_options: {
                    card: {
                        auto_capture: true,
                    },
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "x-client-id": clientId,
                },
            }
        );

        console.log("📦 PaymentIntent response:", intentRes.data);

        return NextResponse.json({
            id: intentRes.data.id,
            client_secret: intentRes.data.client_secret,
            status: intentRes.data.status,
        });
    } catch (err: unknown) {
        const error = err as {
            response?: {
                data?: unknown;
                status?: number;
            };
            message?: string;
        };
        console.error("❌ Airwallex API full error:", {
            data: error.response?.data,
            status: error.response?.status,
            message: error.message,
        });
        return NextResponse.json({ error: "Failed to create PaymentIntent" }, { status: 500 });
    }
}
