import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { amount, currency = "USD" } = req.body;

    try {
        const response = await axios.post(
            "https://api.airwallex.com/api/v1/pa/payment_intents/create",
            {
                request_id: `order_${Date.now()}`,
                amount,
                currency,
                merchant_order_id: `merchant_order_${Date.now()}`,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.AIRWALLEX_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return res.status(200).json({
            client_secret: response.data.client_secret,
            id: response.data.id,
        });
    } catch (err: unknown) {
        const error = err as { response?: { data?: any }; message?: string };
        console.error("❌ Airwallex error:", error.response?.data || error.message || error);
        res.status(500).json({ error: "Failed to create PaymentIntent" });
    }
}
