"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ImproveWriting() {
  const t = useTranslations();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleImprove = async () => {
    if (!input.trim()) return;
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
          className="w-full p-4 pr-20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[140px]"
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
            📋
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
            🗑
          </button>
        </div>
      </div>

      {/* Improve Button */}
      <div>
        <button
          onClick={handleImprove}
          disabled={loading || !input.trim()}
          className={`px-4 py-2 text-sm rounded transition ${loading || !input.trim()
            ? "bg-green-100 text-green-400 cursor-not-allowed opacity-50"
            : "bg-green-600 text-white hover:bg-green-700"
            }`}
        >
          {loading ? t("improve.loading") : t("improve.button")}
        </button>
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
    </div>
  );
}
