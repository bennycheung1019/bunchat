"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PurchaseSuccess() {
    const [message, setMessage] = useState("Processing your purchase...");
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setMessage("✅ Payment received. Tokens will be added to your account shortly.");
        }, 1500);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="max-w-md mx-auto py-20 px-6 text-center space-y-6">
            <h1 className="text-3xl font-bold">Purchase Successful</h1>
            <p className="text-gray-700 text-lg">{message}</p>

            {message.startsWith("✅") && (
                <button
                    onClick={() => router.push("/")}
                    className="w-full py-3 text-white font-semibold text-lg rounded-lg bg-blue-600 hover:bg-blue-700 transition duration-150"
                >
                    Back to App
                </button>
            )}
        </div>
    );
}
