"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PurchaseTokens() {
    const { data: session } = useSession();
    const [amount, setAmount] = useState(500); // $5 = 50 tokens
    const [loading, setLoading] = useState(false);

    const handleRedirectToHostedCheckout = async () => {
        if (!session?.user?.id) {
            alert("You must be logged in to purchase tokens.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, customerId: session.user.id }),
            });

            const data = await res.json();

            if (data?.next_action?.redirect_to_url) {
                window.location.href = data.next_action.redirect_to_url;
            } else {
                alert("❌ Failed to create hosted checkout session.");
            }
        } catch (err) {
            console.error("Payment intent error:", err);
            alert("Something went wrong.");
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

            <button
                onClick={handleRedirectToHostedCheckout}
                className={`w-full py-2 text-white font-medium rounded transition ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                disabled={loading}
            >
                {loading ? "Redirecting..." : "Pay Now"}
            </button>
        </div>
    );
}
