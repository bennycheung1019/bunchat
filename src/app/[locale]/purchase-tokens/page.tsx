// ✅ File: /src/app/[locale]/purchase-tokens/page.tsx (Final ESLint-safe build fix)

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface AirwallexElement {
    destroy: () => void;
}

declare global {
    interface Window {
        airwallexCardElement?: AirwallexElement;
    }
}

interface AirwallexGlobal {
    Airwallex?: {
        init: (options: { env: string; origin: string }) => void;
        createElement: (
            type: string,
            options: {
                client_secret: string;
                dom_id: string;
                onReady: (element: AirwallexElement) => void;
            }
        ) => void;
        confirmPaymentIntent: (options: {
            element: AirwallexElement;
            client_secret: string;
        }) => Promise<{ status?: string }>;
    };
}

export default function PurchaseTokens() {
    const { data: session } = useSession();
    const [amount, setAmount] = useState(500);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchIntent = async () => {
            try {
                const res = await fetch("/api/create-payment-intent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount, customerId: session.user.id }),
                });

                const data = await res.json();
                setClientSecret(data.client_secret);
            } catch (err) {
                console.error("Failed to create payment intent:", err);
            }
        };

        fetchIntent();
    }, [amount, session]);


    useEffect(() => {
        const interval = setInterval(() => {
            const Airwallex = (window as unknown as AirwallexGlobal).Airwallex;
            if (Airwallex && clientSecret && document.getElementById("card-container")) {
                clearInterval(interval);

                Airwallex.init({ env: "production", origin: window.location.origin });

                Airwallex.createElement("card", {
                    client_secret: clientSecret,
                    dom_id: "card-container",
                    onReady: (element: AirwallexElement) => {
                        window.airwallexCardElement = element;
                    },
                });
            }
        }, 200);

        return () => clearInterval(interval);
    }, [clientSecret]);

    const handleSubmit = async () => {
        const Airwallex = (window as unknown as AirwallexGlobal).Airwallex;
        const element = window.airwallexCardElement;

        if (!Airwallex || !element || !clientSecret) {
            alert("Card element not ready.");
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
                window.location.href = "/purchase-success?tokens=50";
            } else {
                alert("❌ Payment failed. Please try again.");
            }
        } catch (err) {
            console.error("Payment error:", err);
            alert("An error occurred during payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto py-10 px-4 space-y-6">
            <h2 className="text-xl font-semibold text-center">💳 Enter Card Details</h2>

            <select
                className="w-full border p-2 rounded"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
            >
                <option value={500}>50 Tokens – $5.00</option>
                <option value={1000}>120 Tokens – $10.00</option>
                <option value={2000}>300 Tokens – $20.00</option>
            </select>

            <div id="card-container" className="border p-4 rounded" />

            <button
                onClick={handleSubmit}
                disabled={loading || !clientSecret}
                className={`w-full py-2 text-white font-medium rounded transition ${loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {loading ? "Processing..." : "Pay Now"}
            </button>
        </div>
    );
}
