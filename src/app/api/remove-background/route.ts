import { NextResponse } from "next/server";
import Replicate from "replicate";

export const runtime = "edge";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const input = {
        image: `data:image/jpeg;base64,${buffer.toString("base64")}`,
    };

    const output = await replicate.run("851-labs/background-remover", {
        input,
    });

    return NextResponse.json({ resultUrl: output });
}
