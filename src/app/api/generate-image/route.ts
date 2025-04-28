import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  const style = formData.get("style") as string | null;

  if (!file || !style) {
    return NextResponse.json({ error: "Missing image or style" }, { status: 400 });
  }

  try {
    // Convert uploaded image to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // Here we just generate a new image based on style prompt
    const response = await openai.images.generate({
      model: "dall-e-3", // or "dall-e-2"
      prompt: `Make this image ${style}`,
      n: 1,
      size: "512x512",
      response_format: "url",
    });

    const generatedImageUrl = response.data[0].url;

    return NextResponse.json({ generatedImageUrl });
  } catch (error) {
    console.error("OpenAI Image Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate image." }, { status: 500 });
  }
}
