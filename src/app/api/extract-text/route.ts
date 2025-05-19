import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { imageUrl } = await req.json();

        if (!imageUrl) {
            return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
        }

        const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: "a524caeaa23495bc9edc805ab08ab5fe943afd3febed884a4f3747aa32e9cd61", // OCR model version
                input: {
                    image: imageUrl,
                },
            }),
        });

        if (!replicateRes.ok) {
            const error = await replicateRes.text();
            console.error("Replicate error:", error);
            return NextResponse.json({ error: "Replicate API error" }, { status: 500 });
        }

        const replicateData = await replicateRes.json();

        const predictionUrl = replicateData.urls.get;

        // Polling for result
        let resultText = "";
        let status = replicateData.status;
        const maxAttempts = 20;
        let attempts = 0;

        while (status !== "succeeded" && status !== "failed" && attempts < maxAttempts) {
            await new Promise((res) => setTimeout(res, 1000));
            const statusCheck = await fetch(predictionUrl, {
                headers: {
                    Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
                },
            });
            const statusJson = await statusCheck.json();
            status = statusJson.status;

            if (status === "succeeded") {
                resultText = statusJson.output || "";
                break;
            }

            attempts++;
        }

        if (status === "succeeded") {
            return NextResponse.json({ resultText });
        } else {
            return NextResponse.json({ error: "OCR failed" }, { status: 500 });
        }

    } catch (err) {
        console.error("❌ OCR API error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
