import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // securely from .env.local
});

export async function POST(req: Request) {
  const { message, systemPrompt, history } = await req.json();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a helpful assistant.",
        },
        ...(history?.length
          ? history.map((m: { role: "user" | "ai"; text: string }) => ({
              role: m.role === "ai" ? "assistant" : "user",
              content: m.text,
            }))
          : []),
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message?.content || "No reply from AI";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "Failed to get response from AI." },
      { status: 500 }
    );
  }
}
