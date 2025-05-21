"use client";

import { useEffect, useState } from "react";

interface BillingItem {
    id: string;
    date: string;
    tokens: number;
    amount: string;
}

export default function BillingHistory() {
    const [history, setHistory] = useState<BillingItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBilling = async () => {
            try {
                const res = await fetch("/api/billing-history");
                if (!res.ok) throw new Error(`API error ${res.status}`);
                const data: BillingItem[] = await res.json();
                setHistory(data);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Unexpected error occurred.";
                console.error("Billing fetch error:", message);
                setError("Failed to load billing history.");
            }
        };

        fetchBilling();
    }, []);

    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-xl font-bold mb-4">Billing History</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100 text-gray-700 text-sm">
                        <tr>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Tokens</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="px-4 py-2">{item.date}</td>
                                <td className="px-4 py-2">{item.tokens}</td>
                                <td className="px-4 py-2">{item.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
