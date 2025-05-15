// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "zh-Hant", "zh-Hans"];
const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ✅ Allow static files and API
    if (
        PUBLIC_FILE.test(pathname) ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next")
    ) {
        return NextResponse.next();
    }

    // ✅ Redirect `/` to preferred locale landing
    if (pathname === "/") {
        const preferredLanguage =
            req.cookies.get("preferredLanguage")?.value || "en";
        const locale = locales.includes(preferredLanguage)
            ? preferredLanguage
            : "en";

        return NextResponse.redirect(new URL(`/${locale}/landing`, req.url));
    }

    // ✅ If the path already starts with a valid locale, allow it
    const firstSegment = pathname.split("/")[1];
    if (locales.includes(firstSegment)) {
        return NextResponse.next();
    }

    // ✅ Redirect any other path missing a locale
    const preferredLanguage =
        req.cookies.get("preferredLanguage")?.value || "en";
    const locale = locales.includes(preferredLanguage)
        ? preferredLanguage
        : "en";

    return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url));
}

export const config = {
    matcher: ["/((?!_next|favicon.ico).*)"],
};
