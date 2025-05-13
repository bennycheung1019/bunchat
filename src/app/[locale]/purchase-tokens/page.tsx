"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function amountToTokens(amount: number) {
    if (amount === 500) return 50;
    if (amount === 1000) return 120;
    if (amount === 2000) return 300;
    return 0;
}

function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/purchase-success`, // ✅ clean URL, no query string
            },
        });

        if (result.error) {
            alert(result.error.message);
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <button
                type="submit"
                disabled={loading || !stripe}
                className="w-full py-2 text-white font-medium rounded bg-blue-600 hover:bg-blue-700"
            >
                {loading ? "Processing..." : "Pay Now"}
            </button>
        </form>
    );
}

export default function PurchaseTokens() {
    const { data: session } = useSession();
    const [amount, setAmount] = useState(500);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        const fetchIntent = async () => {
            if (!session?.user?.id) return;

            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, customerId: session.user.id }),
            });

            const data = await res.json();
            setClientSecret(data.clientSecret);
        };

        fetchIntent();
    }, [amount, session]);

    return (
        <div className="max-w-md mx-auto py-10 px-4 space-y-6">
            <h2 className="text-xl font-semibold text-center">💳 Choose Payment Option</h2>

            <select
                className="w-full border p-2 rounded"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
            >
                <option value={500}>50 Tokens – $5.00</option>
                <option value={1000}>120 Tokens – $10.00</option>
                <option value={2000}>300 Tokens – $20.00</option>
            </select>

            {clientSecret && (
                <Elements options={{ clientSecret }} stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            )}
        </div>
    );
}
