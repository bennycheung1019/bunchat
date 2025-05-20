import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing or invalid prompt" }, { status: 400 });
    }

    const versionId = "6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe";

    // Step 1: Start prediction
    const startRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: versionId,
        input: {
          prompt,
          negative_prompt: "worst quality, low quality",
          scheduler: "K_EULER",
          width: 1024,
          height: 1024,
          guidance_scale: 0,
          num_inference_steps: 4,
        }
      }),

    });

    const prediction = await startRes.json();
    if (!prediction?.id) {
      console.error("⚠️ Prediction failed to start:", prediction);
      return NextResponse.json({ error: "Failed to start image generation" }, { status: 500 });
    }

    // Step 2: Poll until complete
    let finalOutput = prediction;
    while (
      finalOutput.status !== "succeeded" &&
      finalOutput.status !== "failed"
    ) {
      await new Promise((res) => setTimeout(res, 1000));

      const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      finalOutput = await checkRes.json();
    }

    // Step 3: Return output
    if (finalOutput.status === "succeeded" && Array.isArray(finalOutput.output)) {
      return NextResponse.json({ imageUrl: finalOutput.output[0] });
    }

    console.error("❌ Image generation failed:", finalOutput);
    return NextResponse.json({ error: "No image returned from model" }, { status: 500 });

  } catch (err) {
    console.error("❌ Error generating image:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
