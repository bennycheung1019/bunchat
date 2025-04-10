import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // securely from .env.local
})

export async function POST(req: Request) {
  const { message } = await req.json()

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use OpenAI's new GPT-4o model
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    })

    const reply = response.choices[0].message?.content || "No reply from GPT-4o"

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("OpenAI GPT-4o Error:", error)
    return NextResponse.json(
      { error: "Failed to get response from GPT-4o." },
      { status: 500 }
    )
  }
}
