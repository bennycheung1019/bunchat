"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useTokenContext } from "@/context/TokenContext";
import { deductTokens } from "@/lib/tokenUtils";
import DiamondIcon from "@/components/icons/DiamondIcon";
import TokenWarningModal from "@/components/modals/TokenWarningModal";
import PasteIcon from "@/components/icons/PasteIcon";
import DeleteIcon from "@/components/icons/DeleteIcon";

export default function ReplyEmail() {
  const t = useTranslations("reply");
  const [originalEmail, setOriginalEmail] = useState("");
  const [replySummary, setReplySummary] = useState("");
  const [replyTone, setReplyTone] = useState<"formal" | "friendly" | "short">(
    "formal"
  );
  const [generatedReply, setGeneratedReply] = useState("");
  const [showCopied, setShowCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { tokenBalance, refreshTokenBalance } = useTokenContext();
  const [showTokenModal, setShowTokenModal] = useState(false);



  const tones = ["short", "formal", "friendly"];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1500);
  };

  const handleGenerateReply = async () => {
    if (tokenBalance < 1) { // Adjust the required token amount if needed
      setShowTokenModal(true);
      return;
    }


    setLoading(true);

    try {
      const res = await fetch("/api/generate-reply-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalEmail,
          replySummary,
          tone: replyTone,
        }),
      });

      const data = await res.json();
      setGeneratedReply(data.reply || t("error"));

      if (data.reply && session?.user?.id) {
        await deductTokens(session.user.id, 2);  // ✅ TOKEN AMOUNT HERE
        await refreshTokenBalance();
      }

    } catch (error) {
      console.error("Error generating reply:", error);
      setGeneratedReply(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto w-full space-y-6">

      {/* Original Email Input */}
      <div className="relative">
        <textarea
          value={originalEmail}
          onChange={(e) => setOriginalEmail(e.target.value)}
          placeholder={t("placeholderEmail")}
          className="w-full p-4 pr-20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-700 focus:border-green-700 min-h-[140px]"
        />
        {/* Paste & Clear Icons */}
        <div className="absolute bottom-3 right-4 flex gap-3">
          {/* Paste */}
          <button
            onClick={async () => {
              const text = await navigator.clipboard.readText();
              setOriginalEmail(text);
            }}
            title={t("paste")}
            className="text-gray-500 hover:text-blue-600 transition"
          >
            <PasteIcon></PasteIcon>
          </button>

          {/* Clear */}
          <button
            onClick={() => setOriginalEmail("")}
            title={t("clear")}
            disabled={!originalEmail.trim()}
            className={`transition ${originalEmail.trim()
              ? "text-gray-500 hover:text-red-500"
              : "text-gray-300 cursor-not-allowed"
              }`}
          >
            <DeleteIcon></DeleteIcon>
          </button>
        </div>
      </div>

      {/* Summary Input */}
      <textarea
        value={replySummary}
        onChange={(e) => setReplySummary(e.target.value)}
        placeholder={t("placeholderSummary")}
        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-700 focus:border-green-700 min-h-[120px]"
      />

      {/* Tone Selector */}
      <div className="flex gap-3 flex-wrap">
        {tones.map((tone) => (
          <button
            key={tone}
            type="button"
            onClick={() => setReplyTone(tone as typeof replyTone)}
            className={`px-4 py-2 text-sm rounded border font-medium transition ${replyTone === tone
              ? "bg-green-700 text-white border-green-700"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
          >
            {t(`tone.${tone}`)}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <div className="flex items-center justify-between w-full gap-4">
        {/* Generate Button */}
        <button
          onClick={handleGenerateReply}
          disabled={!originalEmail.trim() || !replySummary.trim()}
          className={`flex-1 px-4 py-2 text-sm rounded-md font-medium transition shadow-sm ${!originalEmail.trim() || !replySummary.trim()
            ? "bg-[#d1e1db] text-white cursor-not-allowed"
            : "bg-green-700 text-white hover:bg-green-800"
            }`}
        >
          {loading ? t("loading") : t("generate")}
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
        onClick={() => handleCopy(generatedReply)}
      >
        {generatedReply || t("placeholderOutput")}
      </div>

      {/* Copied Toast */}
      {showCopied && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-28 bg-black text-white text-xs px-3 py-1 rounded shadow-lg z-50 animate-fadeIn">
          {t("copied")}
        </div>
      )}
      {showTokenModal && <TokenWarningModal onClose={() => setShowTokenModal(false)} />}

    </div>
  );
}
