import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
    const { imageUrl, scale = 2, face_enhance = true } = await req.json();



    if (!imageUrl) {
        return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    try {
        // 🎯 Call Replicate Real-ESRGAN with hosted image URL
        const prediction = await replicate.predictions.create({
            version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
            input: {
                image: imageUrl,
                scale,
                face_enhance,
            },
            wait: true,
        });

        const resultUrl = prediction.output;
        console.log("🟢 Upscaling result:", resultUrl);

        return NextResponse.json({ resultUrl });
    } catch (error) {
        console.error("🔴 Replicate API error:", error);
        return NextResponse.json({ error: "Upscaling failed" }, { status: 500 });
    }
}
