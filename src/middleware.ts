// src/middleware.ts

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

const locales = ["en", "zh-Hant", "zh-Hans"];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Skip next if it's a static file or API
    if (PUBLIC_FILE.test(pathname) || pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}`)
    );

    if (pathnameIsMissingLocale) {
        // Try to get from localStorage-like cookies first
        const preferredLanguage = req.cookies.get("preferredLanguage")?.value;

        const locale = preferredLanguage || "en"; // fallback default

        return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url));
    }

    return NextResponse.next();
}

// Tell Next.js to run middleware on all routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - Static files (_next, favicon, etc.)
         * - API routes
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
