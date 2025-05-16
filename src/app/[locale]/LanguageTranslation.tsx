"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useTokenContext } from "@/context/TokenContext";
import { deductTokens } from "@/lib/tokenUtils";
import DiamondIcon from "@/components/icons/DiamondIcon";


export default function LanguageTranslation() {
  const t = useTranslations("translate");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const { data: session } = useSession();
  const { tokenBalance, refreshTokenBalance } = useTokenContext();


  const handleTranslate = async (target: "en" | "zh-tw" | "zh-cn") => {
    if (!input.trim()) return;

    if (tokenBalance < 2) {
      alert("Not enough tokens. Please purchase more to use this feature.");
      return;
    }

    setLoading(true);


    const prompt = `"${input}"`; // always quoted

    const systemPrompt = {
      en: "Translate the quoted text to English. Return only the translated version without the quotes",
      "zh-tw":
        "Translate the quoted text to Traditional Chinese. Return only the translated version without the quotes",
      "zh-cn":
        "Translate the quoted text to Simplified Chinese. Return only the translated version without the quotes",
    }[target];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          systemPrompt,
        }),
      });

      const data = await res.json();
      setOutput(data.reply || t("error"));

      if (data.reply && session?.user?.id) {
        await deductTokens(session.user.id, 2); // ✅ TOKEN AMOUNT HERE
        await refreshTokenBalance();
      }

    } catch (err) {
      console.error(err);
      setOutput(t("error"));
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
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full p-4 pr-20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[140px]"
        />

        {/* Paste & Clear Icons */}
        <div className="absolute bottom-3 right-4 flex gap-3">
          {/* Paste */}
          <button
            onClick={async () => {
              const text = await navigator.clipboard.readText();
              setInput(text);
            }}
            title={t("paste")}
            className="text-gray-500 hover:text-blue-600 transition"
          >
            {/* Clipboard Paste Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500 hover:text-blue-600 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0M9 5a2 2 0 014 0m-4 6h4m-4 4h4"
              />
            </svg>
          </button>

          {/* Clear */}
          <button
            onClick={() => setInput("")}
            title={t("clear")}
            disabled={!input.trim()}
            className={`transition ${input.trim()
              ? "text-gray-500 hover:text-red-500"
              : "text-gray-300 cursor-not-allowed"
              }`}
          >
            {/* trash can Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${input.trim()
                ? "text-gray-500 hover:text-red-600"
                : "text-gray-300"
                }`}
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

      {/* Action Buttons */}
      <div className="flex items-center justify-between w-full mt-2 gap-4">
        {/* Translate Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleTranslate("en")}
            disabled={loading || !input.trim()}
            className={`px-4 py-2 text-sm rounded transition ${input.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-100 text-blue-400 cursor-not-allowed opacity-50"
              }`}
          >
            {t("toEnglish")}
          </button>

          <button
            onClick={() => handleTranslate("zh-tw")}
            disabled={loading || !input.trim()}
            className={`px-4 py-2 text-sm rounded transition ${input.trim()
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-green-100 text-green-400 cursor-not-allowed opacity-50"
              }`}
          >
            {t("toTraditional")}
          </button>

          <button
            onClick={() => handleTranslate("zh-cn")}
            disabled={loading || !input.trim()}
            className={`px-4 py-2 text-sm rounded transition ${input.trim()
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-yellow-100 text-yellow-400 cursor-not-allowed opacity-50"
              }`}
          >
            {t("toSimplified")}
          </button>
        </div>

        {/* 💎 Token Cost */}
        <div className="flex items-center gap-1 text-xs text-gray-500 pr-1">
          <DiamondIcon className="w-4 h-4 text-blue-500" />
          <span>1</span>
        </div>
      </div>


      {/* Translated Output */}
      <div
        className="p-4 rounded-lg bg-yellow-50 text-yellow-900 border border-yellow-200 shadow-inner cursor-pointer whitespace-pre-line hover:ring-2 ring-yellow-300 transition"
        onClick={() => handleCopy(output)}
      >
        {output || t("placeholderOutput")}
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
