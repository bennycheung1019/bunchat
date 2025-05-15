import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config"
import { saveUserSettingsToFirestore } from "@/lib/saveUserSettingsToFirestore";

export async function POST(req: NextRequest) {
    console.log("🟢 Received POST /api/save-language");
    const session = await getServerSession(authConfig);
    console.log("🧑‍💻 Session:", session?.user?.id);

    if (!session?.user?.id) {
        console.warn("⛔ No session found. Rejecting.");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { language } = body;
    console.log("🌐 Language to save:", language);

    if (!["en", "zh-Hant", "zh-Hans"].includes(language)) {
        return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    await saveUserSettingsToFirestore(session.user.id, "light", language);

    return NextResponse.json({ success: true });
}
