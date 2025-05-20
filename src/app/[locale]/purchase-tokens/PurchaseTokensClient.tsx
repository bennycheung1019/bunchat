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
import DiamondIcon from "@/components/icons/DiamondIcon"; // ✅ adjust path as needed


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

function TokenSelector({
    amount,
    onSelect,
}: {
    amount: number | null;
    onSelect: (val: number) => void;
}) {
    const t = useTranslations("purchase");

    const packages = [
        { value: 500, label: 50, price: "USD$ 5.00", saveKey: null },
        { value: 1000, label: 120, price: "USD$ 10.00", saveKey: "save17" },
        { value: 2000, label: 300, price: "USD$ 20.00", saveKey: "save33" },
    ];

    return (
        <div className="space-y-3">
            <div className="grid gap-4">
                {packages.map((pkg) => {
                    const isSelected = amount === pkg.value;

                    return (
                        <div key={pkg.value} className="relative">
                            <button
                                onClick={() => onSelect(pkg.value)}
                                className={`flex items-center justify-between w-full px-5 py-4 rounded-xl border transition font-medium text-left ${isSelected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                                    }`}
                            >
                                <div className="flex items-center gap-2 text-base">
                                    {pkg.label}
                                    <DiamondIcon className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="text-sm">{pkg.price}</div>
                            </button>

                            {pkg.saveKey && (
                                <span
                                    className={`absolute -top-3 right-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isSelected ? "bg-yellow-300 text-black" : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {t(pkg.saveKey)}
                                </span>

                            )}
                        </div>
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
    const [amount, setAmount] = useState<number | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const t = useTranslations("purchase");

    // 🔁 Handle package selection and reset previous Stripe intent
    const handleAmountChange = (val: number) => {
        setAmount(val);
        setClientSecret(null);
        setPaymentIntentId(null);
    };

    // 🔁 Fetch a new PaymentIntent whenever a new amount is selected
    useEffect(() => {
        if (!session?.user?.id || amount === null) return;

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

            <label className="block font-medium text-gray-700">{t("choosePackage")}</label>
            <TokenSelector amount={amount} onSelect={handleAmountChange} />

            {amount === null ? (
                <p className="text-center text-gray-400">{t("selectPrompt") ?? "Please select a token package."}</p>
            ) : clientSecret && paymentIntentId ? (
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
                    onClick={() => router.back()}

                    className="w-full py-3 text-gray-700 font-semibold text-lg rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition duration-150"
                >
                    {t("back")}
                </button>
            </div>
        </div>
    );
}
