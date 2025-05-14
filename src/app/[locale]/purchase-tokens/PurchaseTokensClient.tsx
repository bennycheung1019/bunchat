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

            <div className="space-y-3">
                <label htmlFor="amount" className="block font-medium text-gray-700">
                    {t("choosePackage")}
                </label>
                <select
                    className="w-full border p-2 rounded"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                >
                    <option value={500}>50 Tokens – $5.00</option>
                    <option value={1000}>120 Tokens – $10.00</option>
                    <option value={2000}>300 Tokens – $20.00</option>
                </select>
            </div>

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
