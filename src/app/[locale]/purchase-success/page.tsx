"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PurchaseSuccess() {
    const searchParams = useSearchParams();
    const [statusMessage, setStatusMessage] = useState("Processing your purchase...");
    const [intentId, setIntentId] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams.get("payment_intent");
        console.log("🚦 URL payment_intent:", id);
        setIntentId(id);
    }, [searchParams]);

    useEffect(() => {
        if (!intentId) return;

        const checkPayment = async () => {
            try {
                const stripe = await stripePromise;
                if (!stripe) throw new Error("Stripe not loaded");

                const res = await fetch(`/api/retrieve-client-secret?payment_intent=${intentId}`);
                const data = await res.json();

                if (!data.client_secret) throw new Error("Missing client_secret");
                const { paymentIntent } = await stripe.retrievePaymentIntent(data.client_secret);

                if (paymentIntent?.status === "succeeded") {
                    setStatusMessage("✅ Payment received. Tokens will appear in your account shortly.");
                } else {
                    setStatusMessage("❌ Payment was not successful.");
                }
            } catch (err) {
                console.error("❌ Error verifying payment:", err);
                setStatusMessage("❌ Could not verify payment. Please contact support.");
            }
        };

        checkPayment();
    }, [intentId]);

    return (
        <div className="max-w-md mx-auto py-20 px-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Purchase Successful</h1>
            <p className="text-gray-700">{statusMessage}</p>
        </div>
    );
}
