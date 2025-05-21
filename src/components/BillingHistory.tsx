"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface BillingItem {
    id: string;
    date: string;
    tokens: number;
    amount: string;
}

export default function BillingHistory() {
    const t = useTranslations("billing"); // Expect "billing" namespace in i18n
    const [history, setHistory] = useState<BillingItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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
                setError(t("error"));
            } finally {
                setLoading(false);
            }
        };

        fetchBilling();
    }, [t]);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">{t("title")}</h2>

            {loading && (
                <div className="text-center text-gray-500 py-8 animate-pulse">
                    {t("loading")}
                </div>
            )}

            {error && (
                <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-md">
                    {error}
                </div>
            )}

            {!loading && history.length === 0 && !error && (
                <div className="text-center text-gray-500">{t("empty")}</div>
            )}

            {!loading && history.length > 0 && (
                <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium text-gray-700">{t("date")}</th>
                                <th className="px-4 py-3 font-medium text-gray-700">{t("tokens")}</th>
                                <th className="px-4 py-3 font-medium text-gray-700">{t("amount")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {history.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-gray-800">{item.date}</td>
                                    <td className="px-4 py-3 text-gray-800">{item.tokens}</td>
                                    <td className="px-4 py-3 text-gray-800">{item.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
