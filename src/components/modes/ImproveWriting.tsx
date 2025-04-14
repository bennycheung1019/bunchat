"use client";

import { useState } from "react";

export default function ImproveWriting() {
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
          message: `"${input}"`, // quote the message as per your system prompt convention
          systemPrompt:
            "You are a writing assistant. The user's message will always be inside quotation marks. Rewrite only the quoted text to be clearer, more concise, and professional. Return only the improved version without quotes.",
          history: [],
        }),
      });

      const data = await res.json();
      setOutput(data.reply || "No reply.");
    } catch (err) {
      console.error(err);
      setOutput("Error improving text.");
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
      {/* Textarea */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type or paste something here..."
        className="w-full p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[140px]"
      />

      {/* Action Row: Left buttons + Improve button on right */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Paste & Clear buttons */}
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const text = await navigator.clipboard.readText();
              setInput(text);
            }}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition"
            title="Paste from clipboard"
          >
            Paste
          </button>
          <button
            onClick={() => setInput("")}
            disabled={!input.trim()}
            className={`px-4 py-2 text-sm rounded transition ${
              input.trim()
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed"
            }`}
            title="Clear text"
          >
            Clear
          </button>
        </div>

        {/* Improve Writing button on the right */}
        <button
          onClick={handleImprove}
          disabled={loading || !input.trim()}
          className={`px-4 py-2 text-sm rounded transition ml-auto ${
            loading || !input.trim()
              ? "bg-blue-100 text-blue-400 cursor-not-allowed opacity-50"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {loading ? "Improving..." : "Improve Writing"}
        </button>

        {showCopied && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-28 bg-black text-white text-xs px-3 py-1 rounded shadow-lg z-50 animate-fadeIn">
            Copied!
          </div>
        )}

        <div
          className="w-full p-4 rounded-lg bg-yellow-50 text-yellow-900 border border-yellow-200 shadow-inner cursor-pointer whitespace-pre-line hover:ring-2 ring-yellow-300 transition"
          onClick={() => handleCopy(output)}
        >
          {output || "Improved version will appear here."}
        </div>
      </div>
    </div>
  );
}
