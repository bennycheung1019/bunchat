import { NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;
const locales = ["en", "zh-Hant", "zh-Hans"];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ✅ Allow root and /landing (non-locale routes)
    if (pathname === "/" || pathname.startsWith("/landing")) {
        return NextResponse.next();
    }

    // ✅ Skip static assets and API calls
    if (PUBLIC_FILE.test(pathname) || pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // ✅ Short-circuit if the path already contains a supported locale
    const hasLocale = locales.some((locale) => pathname.startsWith(`/${locale}`));
    if (hasLocale) {
        return NextResponse.next();
    }

    // ✅ If no locale in path, redirect to preferred or fallback
    const preferredLanguage = req.cookies.get("preferredLanguage")?.value;
    const locale = locales.includes(preferredLanguage || "") ? preferredLanguage : "zh-Hant";

    return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url));
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
