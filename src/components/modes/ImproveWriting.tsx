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
            "You are a writing assistant. The user's message will always be inside quotation marks. Rewrite only the quoted text to be clearer, more concise, and professional. Return only the improved version without that quotation marks.",
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
      {/* Textarea with icons */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste something here..."
          className="w-full p-4 pr-20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[140px]"
        />

        {/* Icons inside input only */}
        <div className="absolute bottom-3 right-4 flex gap-3">
          {/* Paste */}
          <button
            onClick={async () => {
              const text = await navigator.clipboard.readText();
              setInput(text);
            }}
            title="Paste"
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 104 0M9 5a2 2 0 014 0m-4 6h4m-4 4h4"
              />
            </svg>
          </button>

          {/* Clear */}
          <button
            onClick={() => setInput("")}
            title="Clear"
            disabled={!input.trim()}
            className={`transition ${input.trim()
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

      {/* Improve Button */}
      <div className="w-full justify-start">
        <button
          onClick={handleImprove}
          disabled={loading || !input.trim()}
          className={`px-4 py-2 text-sm rounded transition ml-auto ${loading || !input.trim()
              ? "bg-green-100 text-green-400 cursor-not-allowed opacity-50"
              : "bg-green-600 text-white hover:bg-green-700"
            }`}
        >
          {loading ? "Improving..." : "Improve Writing"}
        </button>
      </div>

      {/* Output Box */}
      <div
        className="p-4 rounded-lg bg-yellow-50 text-yellow-900 border border-yellow-200 shadow-inner cursor-pointer whitespace-pre-line hover:ring-2 ring-yellow-300 transition"
        onClick={() => handleCopy(output)}
      >
        {output || "Improved version will appear here."}
      </div>

      {showCopied && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-28 bg-black text-white text-xs px-3 py-1 rounded shadow-lg z-50 animate-fadeIn">
          Copied!
        </div>
      )}
    </div>
  );
}
