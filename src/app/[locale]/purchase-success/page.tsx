// ✅ File: /src/app/[locale]/purchase-success/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function PurchaseSuccess() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tokens = Number(searchParams.get("tokens"));
    const [status, setStatus] = useState("Processing your purchase...");

    useEffect(() => {
        const applyTokens = async () => {
            if (!session?.user?.id || !tokens || isNaN(tokens)) {
                setStatus("❌ Invalid token amount or user session.");
                return;
            }

            try {
                const db = getFirestore(app);
                const userRef = doc(db, "users", session.user.id);
                const userSnap = await getDoc(userRef);
                const current = userSnap.exists() ? userSnap.data().tokens || 0 : 0;

                await updateDoc(userRef, { tokens: current + tokens });

                setStatus(`✅ ${tokens} tokens added to your account.`);
                setTimeout(() => router.push("/"), 3000);
            } catch (err) {
                console.error("Error applying tokens:", err);
                setStatus("❌ Failed to update your account. Please contact support.");
            }
        };

        applyTokens();
    }, [session, tokens, router]);

    return (
        <div className="max-w-md mx-auto py-20 px-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Purchase Successful</h1>
            <p className="text-gray-700">{status}</p>
        </div>
    );
}
