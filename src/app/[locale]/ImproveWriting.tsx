"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { deductTokens } from "@/lib/tokenUtils";
import { useSession } from "next-auth/react";
import { useTokenContext } from "@/context/TokenContext";
import DiamondIcon from "@/components/icons/DiamondIcon";
import TokenWarningModal from "@/components/modals/TokenWarningModal";
import PasteIcon from "@/components/icons/PasteIcon";
import DeleteIcon from "@/components/icons/DeleteIcon";


export default function ImproveWriting() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const { data: session } = useSession();
  const { tokenBalance, refreshTokenBalance } = useTokenContext();
  const [showTokenModal, setShowTokenModal] = useState(false);


  const handleImprove = async () => {
    if (!session?.user?.id) {
      alert("Please sign in again.");
      return;
    }

    if (!input.trim()) return;

    if (tokenBalance < 1) { // Adjust cost if needed
      setShowTokenModal(true);
      return;
    }

    setLoading(true);


    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `"${input}"`,
          systemPrompt:
            "You are a writing assistant. The user's message will always be inside quotation marks. Rewrite only the quoted text to be clearer, more concise, and professional. Return only the improved version without that quotation marks.",
        }),
      });

      const data = await res.json();
      setOutput(data.reply || t("improve.error"));
      if (data.reply && session?.user?.id) {
        await deductTokens(session.user.id, 1); // ✅ TOKEN AMOUNT HERE
        await refreshTokenBalance();
      }

    } catch (err) {
      console.error(err);
      setOutput(t("improve.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1500);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto w-full space-y-4">
      {/* Input Textarea */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("improve.placeholder")}
          className="w-full p-4 pr-20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-700 focus:border-green-700 min-h-[140px]"
        />

        {/* Action Icons */}
        <div className="absolute bottom-3 right-4 flex gap-3">
          {/* Paste */}
          <button
            onClick={async () => {
              const text = await navigator.clipboard.readText();
              setInput(text);
            }}
            title={t("common.paste")}
            className="text-gray-500 hover:text-blue-600 transition"
          >
            <PasteIcon></PasteIcon>
          </button>

          {/* Clear */}
          <button
            onClick={() => setInput("")}
            title={t("common.clear")}
            disabled={!input.trim()}
            className={`transition ${input.trim()
              ? "text-gray-500 hover:text-red-500"
              : "text-gray-300 cursor-not-allowed"
              }`}
          >
            <DeleteIcon></DeleteIcon>
          </button>
        </div>

      </div>

      {/* Improve Button */}
      <div className="flex items-center justify-between w-full gap-4">
        {/* Improve Button */}
        <button
          onClick={handleImprove}
          disabled={loading || !input.trim()}
          className={`flex-1 px-4 py-2 text-sm rounded-md font-medium transition shadow-sm ${loading || !input.trim()
            ? "bg-[#d1e1db] text-white cursor-not-allowed"
            : "bg-green-700 text-white hover:bg-green-800"
            }`}
        >
          {loading ? t("improve.loading") : t("improve.button")}
        </button>



        {/* 💎 Token Cost */}
        <div className="flex items-center gap-1 text-xs text-gray-500 pr-1">
          <DiamondIcon />
          <span>1</span>
        </div>
      </div>




      {/* Output */}
      <div
        className="p-4 rounded-lg bg-yellow-50 text-yellow-900 border border-yellow-200 shadow-inner cursor-pointer whitespace-pre-line hover:ring-2 ring-yellow-300 transition"
        onClick={() => handleCopy(output)}
      >
        {output || t("improve.placeholderOutput")}
      </div>

      {showCopied && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-28 bg-black text-white text-xs px-3 py-1 rounded shadow-lg z-50 animate-fadeIn">
          {t("common.copied")}
        </div>
      )}
      {showTokenModal && <TokenWarningModal onClose={() => setShowTokenModal(false)} />}

    </div>
  );
}
