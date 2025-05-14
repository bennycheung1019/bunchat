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
import { useTranslations } from "next-intl";
import type { StripeElementLocale } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function stripeLocaleFromAppLocale(appLocale: string): StripeElementLocale {
    switch (appLocale) {
        case "zh-Hant":
            return "zh-HK";
        case "zh-Hans":
            return "zh";
        case "en":
        default:
            return "en";
    }
}

function DiamondIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path d="M6 3L3 9l9 12 9-12-3-6H6z" />
        </svg>
    );
}

function TokenSelector({
    amount,
    setAmount,
}: {
    amount: number;
    setAmount: (val: number) => void;
}) {
    const packages = [
        { value: 500, label: 50, price: "$5.00" },
        { value: 1000, label: 120, price: "$10.00" },
        { value: 2000, label: 300, price: "$20.00" },
    ];

    return (
        <div className="space-y-3">
            <div className="grid gap-2">
                {packages.map((pkg) => {
                    const isSelected = amount === pkg.value;

                    return (
                        <button
                            key={pkg.value}
                            onClick={() => setAmount(pkg.value)}
                            className={`flex items-center justify-between w-full px-4 py-2 rounded-md border transition font-medium ${isSelected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            <span className={`flex items-center gap-1 ${isSelected ? "text-white" : "text-gray-800"}`}>
                                {pkg.label}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`w-4 h-4 ${isSelected ? "text-white" : "text-blue-500"}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path d="M6 3L3 9l9 12 9-12-3-6H6z" />
                                </svg>
                            </span>
                            <span className={`text-sm ${isSelected ? "text-white" : "text-gray-500"}`}>{pkg.price}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const t = useTranslations("purchase");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);

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
                {loading ? t("processing") : t("payNow")}
            </button>
        </form>
    );
}

export function PurchaseTokensClient({ locale }: { locale: string }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [amount, setAmount] = useState(500);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const t = useTranslations("purchase");

    useEffect(() => {
        if (!session?.user?.id || !amount) return;

        const fetchIntent = async () => {
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
    }, [amount, session?.user?.id]);

    return (
        <div className="max-w-md mx-auto py-12 px-6 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">{t("title")}</h1>
                <p className="text-gray-600">{t("subtitle")}</p>
            </div>

            <label className="block font-medium text-gray-700">
                {t("choosePackage")}
            </label>
            <TokenSelector amount={amount} setAmount={setAmount} />

            {clientSecret && paymentIntentId ? (
                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret,
                        locale: stripeLocaleFromAppLocale(locale),
                    }}
                >
                    <CheckoutForm />
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
                    {t("back")}
                </button>
            </div>
        </div>
    );
}
