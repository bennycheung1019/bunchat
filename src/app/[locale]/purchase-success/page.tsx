"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PurchaseSuccess() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const intentId = searchParams.get("payment_intent");
    const [statusMessage, setStatusMessage] = useState("Processing your purchase...");

    useEffect(() => {
        if (!intentId || !session?.user?.id) return;


        const processPayment = async () => {
            try {
                const res = await fetch(`/api/retrieve-client-secret?payment_intent=${intentId}`);
                const data = await res.json();
                console.log("🔁 fetch status:", res.status);
                console.log("📦 fetch result:", data);

                const clientSecret = data.client_secret;

                if (!clientSecret) throw new Error("No client_secret returned");

                const stripe = await stripePromise;
                if (!stripe) throw new Error("Stripe not loaded");

                const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
                const metadata = (paymentIntent as any)?.metadata;
                const tokenAmount = Number(metadata?.tokens || 0);

                if (paymentIntent?.status === "succeeded" && tokenAmount > 0) {
                    const db = getFirestore(app);
                    const userRef = doc(db, "users", session.user.id);
                    const userSnap = await getDoc(userRef);
                    const current = userSnap.exists() ? userSnap.data().tokens || 0 : 0;

                    await updateDoc(userRef, { tokens: current + tokenAmount });

                    setStatusMessage(`✅ ${tokenAmount} tokens added to your account.`);
                    setTimeout(() => router.push("/"), 3000);
                } else {
                    setStatusMessage("❌ Payment failed or token data missing.");
                }
            } catch (err) {
                console.error("Error:", err);
                setStatusMessage("❌ Could not verify payment. Please contact support.");
            }
        };

        processPayment();
    }, [intentId, session, router]);

    if (status === "loading") {
        return (
            <div className="max-w-md mx-auto py-20 px-6 text-center">
                <p className="text-gray-500">Authenticating...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-20 px-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Purchase Successful</h1>
            <p className="text-gray-700">{statusMessage}</p>
        </div>
    );
}
