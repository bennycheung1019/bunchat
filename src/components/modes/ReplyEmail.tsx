"use client";

import { useState } from "react";

interface Props {
  onGenerate: (
    originalEmail: string,
    replySummary: string,
    tone: string
  ) => void;
  generatedReply: string;
}

export default function ReplyEmail({ onGenerate, generatedReply }: Props) {
  const [originalEmail, setOriginalEmail] = useState("");
  const [replySummary, setReplySummary] = useState("");
  const [replyTone, setReplyTone] = useState<
    "formal" | "friendly" | "angry" | "short"
  >("formal");

  const tones = ["formal", "friendly", "angry", "short"];

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Original Email Input */}
      <div className="flex gap-3">
        <textarea
          placeholder="Paste the email you want to reply to"
          className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={originalEmail}
          onChange={(e) => setOriginalEmail(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
          onClick={async () => {
            const text = await navigator.clipboard.readText();
            setOriginalEmail(text);
          }}
        >
          Paste
        </button>
      </div>

      {/* Summary Input */}
      <textarea
        placeholder="Summarize what you want to say"
        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        value={replySummary}
        onChange={(e) => setReplySummary(e.target.value)}
      />

      {/* Tone Selector */}
      <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
        {tones.map((tone) => (
          <label key={tone} className="flex items-center gap-2">
            <input
              type="radio"
              name="tone"
              value={tone}
              checked={replyTone === tone}
              onChange={() => setReplyTone(tone as typeof replyTone)}
              className="accent-blue-600"
            />
            {tone === "short"
              ? "Short & Simple"
              : tone.charAt(0).toUpperCase() + tone.slice(1)}
          </label>
        ))}
      </div>

      {/* Generate Button */}
      <button
        className="px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition"
        onClick={() => onGenerate(originalEmail, replySummary, replyTone)}
        disabled={!originalEmail.trim() || !replySummary.trim()}
      >
        Generate Reply
      </button>

      {/* Output Box */}
      <div
        className="p-4 rounded-lg bg-yellow-50 text-yellow-900 border border-yellow-200 shadow-inner cursor-pointer whitespace-pre-line hover:ring-2 ring-yellow-300 transition"
        onClick={() => {
          navigator.clipboard.writeText(generatedReply);
        }}
      >
        {generatedReply || "Generated email will appear here."}
      </div>
    </div>
  );
}
