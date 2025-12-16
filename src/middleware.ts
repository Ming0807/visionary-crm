import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes (except /admin/login)
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
        const sessionToken = request.cookies.get("admin_session")?.value;

        if (!sessionToken) {
            // Redirect to login
            const loginUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Verify session
        try {
            const session = JSON.parse(
                Buffer.from(sessionToken, "base64").toString()
            );

            // Check expiration
            if (session.exp < Date.now()) {
                const response = NextResponse.redirect(
                    new URL("/admin/login", request.url)
                );
                response.cookies.delete("admin_session");
                return response;
            }
        } catch {
            // Invalid token
            const response = NextResponse.redirect(
                new URL("/admin/login", request.url)
            );
            response.cookies.delete("admin_session");
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
