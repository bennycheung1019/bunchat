"use client";

import { useEffect, useState } from "react";

export default function PurchaseSuccess() {
    const [message, setMessage] = useState("Processing your purchase...");

    useEffect(() => {
        // Optional delay to simulate processing
        const timeout = setTimeout(() => {
            setMessage("✅ Payment received. Tokens will be added to your account shortly.");
        }, 1500);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="max-w-md mx-auto py-20 px-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Purchase Successful</h1>
            <p className="text-gray-700">{message}</p>
        </div>
    );
}
