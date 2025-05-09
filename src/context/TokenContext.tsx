"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

interface TokenContextType {
    tokenBalance: number;
    refreshTokenBalance: () => Promise<void>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session } = useSession();
    const [tokenBalance, setTokenBalance] = useState(0);

    const refreshTokenBalance = useCallback(async () => {
        if (!session?.user?.id) return;
        const db = getFirestore(app);
        const userRef = doc(db, "users", session.user.id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const tokens = userSnap.data().tokens || 0;
            setTokenBalance(tokens);
            console.log("🔄 Updated tokenBalance:", tokens);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        refreshTokenBalance();
    }, [refreshTokenBalance]);

    return (
        <TokenContext.Provider value={{ tokenBalance, refreshTokenBalance }}>
            {children}
        </TokenContext.Provider>
    );
};

export const useTokenContext = () => {
    const context = useContext(TokenContext);
    if (!context) throw new Error("useTokenContext must be used inside a TokenProvider");
    return context;
};
