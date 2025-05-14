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



function CheckoutForm({ paymentIntentId }: { paymentIntentId: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);

        // Log the parameters
        console.log("🧾 Confirming payment with the following parameters:");
        console.log("Elements:", elements);
        console.log("paymentIntentId:", paymentIntentId);

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/purchase-success?payment_intent=${paymentIntentId}`,
            },
            redirect: "always",
        });


        if (result.error) {
            alert(result.error.message);
        }

        setLoading(false);
    };
    console.log("Stripe object:", stripe);
    console.log("Elements object:", elements);
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
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null); // ✅ Moved here

    useEffect(() => {
        console.log("🧩 CheckoutForm mounted");

        const fetchIntent = async () => {
            if (!session?.user?.id) return;

            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, customerId: session.user.id }),
            });

            const data = await res.json();
            setClientSecret(data.clientSecret);
            setPaymentIntentId(data.intentId); // ✅ Set from server response
        };

        fetchIntent();
    }, [amount, session]);


    console.log("💡 Rendering PurchaseTokens with:");
    console.log("clientSecret:", clientSecret);
    console.log("paymentIntentId:", paymentIntentId);

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

            {clientSecret && paymentIntentId ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm paymentIntentId={paymentIntentId} />
                </Elements>
            ) : (
                <p>Loading Stripe…</p>
            )}

        </div>
    );
}
