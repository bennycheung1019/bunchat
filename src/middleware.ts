import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ['en', 'zh-Hant', 'zh-Hans'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip next-intl routes (_next, api, etc.)
    if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // Check if pathname already includes a locale
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}`)
    );

    if (pathnameIsMissingLocale) {
        const locale = defaultLocale;
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}${pathname}`;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// Apply middleware only to routes starting from root
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
