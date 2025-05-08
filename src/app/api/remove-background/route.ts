import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: Request) {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
        return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    try {
        // ⚡ Create a prediction manually
        const prediction = await replicate.predictions.create({
            version: "a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
            input: {
                image: imageUrl,
                format: "png",
                reverse: false,
                threshold: 0,
                background_type: "rgba",
            },
            wait: true, // ⏳ wait for prediction to complete
        });

        console.log("🟡 Prediction Result:", prediction);

        const resultUrl = prediction.output; // this is a real URL string

        return NextResponse.json({ resultUrl });
    } catch (error) {
        console.error("🔴 Replicate API error:", error);
        return NextResponse.json({ error: "Failed to remove background" }, { status: 500 });
    }
}
