"use client";

import { useState } from "react";

interface Props {
  onTranslate: (text: string, targetLang: string) => void;
}

export default function LanguageTranslation({ onTranslate }: Props) {
  const [input, setInput] = useState("");
  const [targetLang, setTargetLang] = useState("en");

  const languages = [
    { label: "English", value: "en" },
    { label: "Traditional Chinese", value: "zh-Hant" },
    { label: "Simplified Chinese", value: "zh-Hans" },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Language selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {languages.map((lang) => (
          <button
            key={lang.value}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
              targetLang === lang.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
            }`}
            onClick={() => setTargetLang(lang.value)}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <textarea
        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        placeholder="Type or paste text to translate..."
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* Translate button */}
      <div className="flex justify-center">
        <button
          className="px-6 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
          onClick={() => onTranslate(input, targetLang)}
          disabled={!input.trim()}
        >
          Translate
        </button>
      </div>
    </div>
  );
}
