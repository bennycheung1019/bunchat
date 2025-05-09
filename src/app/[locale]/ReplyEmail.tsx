"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useTokenContext } from "@/context/TokenContext";
import { deductTokens } from "@/lib/tokenUtils";


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


  const tones = ["short", "formal", "friendly"];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1500);
  };

  const handleGenerateReply = async () => {
    if (tokenBalance < 4) {
      alert("Not enough tokens. Please purchase more to use this feature.");
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
        await deductTokens(session.user.id, 4);  // ✅ TOKEN AMOUNT HERE
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
    <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto w-full min-h-screen overflow-y-auto space-y-6">
      {/* Original Email Input */}
      <div className="relative">
        <textarea
          value={originalEmail}
          onChange={(e) => setOriginalEmail(e.target.value)}
          placeholder={t("placeholderEmail")}
          className="w-full p-4 pr-20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[140px]"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 sm:w-7 sm:h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0m-4 6h4m-4 4h4"
              />
            </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 sm:w-7 sm:h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h10"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary Input */}
      <textarea
        value={replySummary}
        onChange={(e) => setReplySummary(e.target.value)}
        placeholder={t("placeholderSummary")}
        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
      />

      {/* Tone Selector */}
      <div className="flex gap-3 flex-wrap">
        {tones.map((tone) => (
          <button
            key={tone}
            type="button"
            onClick={() => setReplyTone(tone as typeof replyTone)}
            className={`px-4 py-2 text-sm rounded border font-medium transition ${replyTone === tone
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
          >
            {t(`tone.${tone}`)}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateReply}
        disabled={!originalEmail.trim() || !replySummary.trim()}
        className={`px-4 py-2 text-sm rounded transition ml-auto ${originalEmail.trim() && replySummary.trim()
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-green-100 text-green-400 cursor-not-allowed opacity-50"
          }`}
      >
        {loading ? t("loading") : t("generate")}
      </button>

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
    </div>
  );
}
