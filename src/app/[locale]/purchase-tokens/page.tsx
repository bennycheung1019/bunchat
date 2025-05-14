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
import { useRouter } from "next/navigation";


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ paymentIntentId }: { paymentIntentId: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            console.warn("⛔ handleSubmit aborted: Stripe or Elements not ready", { stripe, elements });
            return;
        }

        setLoading(true);

        console.log("🧾 Confirming payment with the following parameters:");
        console.log("Elements:", elements);
        console.log("paymentIntentId:", paymentIntentId);

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/purchase-success`,
            },
            redirect: "always",
        });

        if (result.error) {
            alert(result.error.message);
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <button
                type="submit"
                disabled={loading || !stripe || !elements}
                className="w-full py-3 text-white font-semibold text-lg rounded-lg bg-blue-600 hover:bg-blue-700 transition duration-150"
            >
                {loading ? "Processing..." : "Pay Now"}
            </button>
        </form>
    );
}

export default function PurchaseTokens() {
    const { data: session } = useSession();
    const router = useRouter();
    const [amount, setAmount] = useState(500);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

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
            setPaymentIntentId(data.intentId);
        };

        fetchIntent();
    }, [amount, session]);

    console.log("💡 Rendering PurchaseTokens with:");
    console.log("clientSecret:", clientSecret);
    console.log("paymentIntentId:", paymentIntentId);

    return (
        <div className="max-w-md mx-auto py-12 px-6 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Buy Tokens</h1>
                <p className="text-gray-600">Select a token package and proceed with secure payment.</p>
            </div>

            <div className="space-y-3">
                <label htmlFor="amount" className="block font-medium text-gray-700">
                    💰 Choose Package
                </label>
                <select
                    id="amount"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                >
                    <option value={500}>50 Tokens – $5.00</option>
                    <option value={1000}>120 Tokens – $10.00</option>
                    <option value={2000}>300 Tokens – $20.00</option>
                </select>
            </div>

            {clientSecret && paymentIntentId ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm paymentIntentId={paymentIntentId} />
                </Elements>
            ) : (
                <p className="text-center text-gray-500">Loading Stripe…</p>
            )}

            <div className="text-center">
                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="w-full py-3 text-gray-700 font-semibold text-lg rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition duration-150"
                >
                    Back
                </button>
            </div>


        </div>
    );
}
