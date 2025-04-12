// app/api/generate-reply-email/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { originalEmail, replySummary, tone } = await req.json();

  const systemPrompt =
    tone === "short"
      ? "You are an assistant that writes short and simple emails. Based on the original email and user's intent, reply concisely in 3-5 sentences."
      : `You are an assistant that writes professional emails. Based on the original email and the user's intent, write a full email reply using a ${tone} tone.`;

  const userPrompt = `
Original Email:
${originalEmail}

User wants to reply with:
${replySummary}

Write a full reply email in English with proper formatting.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Reply email error:", error);
    return NextResponse.json(
      { reply: "Failed to generate reply." },
      { status: 500 }
    );
  }
}
