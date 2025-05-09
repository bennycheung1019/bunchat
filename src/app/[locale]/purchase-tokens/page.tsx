"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PurchaseTokens() {
    const { data: session } = useSession();
    const [clientSecret, setClientSecret] = useState("");
    const [amount, setAmount] = useState(500); // $5 = 50 tokens
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const createIntent = async () => {
            if (!amount || !session?.user?.id) return;

            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, customerId: session.user.id }),
            });

            const data = await res.json();
            setClientSecret(data.client_secret);
        };

        createIntent();
    }, [amount, session]);

    useEffect(() => {
        const Airwallex = (window as { Airwallex?: { init: Function; createElement: Function } }).Airwallex;

        const initCard = () => {
            if (!clientSecret || !Airwallex) return;

            Airwallex.init({
                env: "demo",
                origin: window.location.origin,
            });

            Airwallex.createElement("card", {
                client_secret: clientSecret,
                dom_id: "airwallex-card",
                onReady: (element: unknown) => {
                    (window as { airwallexCardElement?: unknown }).airwallexCardElement = element;
                },
            });
        };

        if (Airwallex) {
            initCard();
        } else {
            const check = setInterval(() => {
                const AirwallexNow = (window as { Airwallex?: { init: Function; createElement: Function } }).Airwallex;
                if (AirwallexNow) {
                    initCard();
                    clearInterval(check);
                }
            }, 200);
        }
    }, [clientSecret]);

    const handleConfirm = async () => {
        const Airwallex = (window as { Airwallex?: { confirmPaymentIntent: Function } }).Airwallex;
        const element = (window as { airwallexCardElement?: unknown }).airwallexCardElement;

        if (!Airwallex || !element) {
            alert("Card element is not ready.");
            return;
        }

        setLoading(true);

        try {
            const result = await Airwallex.confirmPaymentIntent({
                element,
                client_secret: clientSecret,
            });

            if (result?.status === "succeeded") {
                alert("✅ Payment successful!");
                window.location.href = `/purchase-success?tokens=${amount === 500 ? 50 : amount === 1000 ? 120 : 300
                    }`;
            } else {
                alert("❌ Payment failed. Please try again.");
            }
        } catch (err) {
            console.error("Payment error:", err);
            alert("Something went wrong with the payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-10 px-4 space-y-6">
            <h2 className="text-xl font-semibold text-center">🎁 Buy Tokens</h2>

            <select
                className="w-full border p-2 rounded"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
            >
                <option value={500}>💎 50 Tokens – $5.00</option>
                <option value={1000}>💎 120 Tokens – $10.00</option>
                <option value={2000}>💎 300 Tokens – $20.00</option>
            </select>

            <div id="airwallex-card" className="border p-4 rounded shadow-sm" />

            <button
                onClick={handleConfirm}
                className={`w-full py-2 text-white font-medium rounded transition ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                disabled={loading}
            >
                {loading ? "Processing..." : "Pay Now"}
            </button>
        </div>
    );
}