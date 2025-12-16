import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Simple admin credentials (in production, use database with hashed passwords)
const ADMIN_USERS = [
    { email: "admin@shop.com", password: "admin123", name: "Admin", role: "admin" },
];

// POST - Admin login
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password required" },
                { status: 400 }
            );
        }

        // Find admin
        const admin = ADMIN_USERS.find(
            (a) => a.email === email && a.password === password
        );

        if (!admin) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create session token (simple version - use JWT in production)
        const sessionToken = Buffer.from(
            JSON.stringify({
                email: admin.email,
                name: admin.name,
                role: admin.role,
                exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            })
        ).toString("base64");

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set("admin_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60, // 24 hours
            path: "/",
        });

        return NextResponse.json({
            success: true,
            admin: {
                email: admin.email,
                name: admin.name,
                role: admin.role,
            },
        });
    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}

// DELETE - Admin logout
export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return NextResponse.json({ success: true });
}

// GET - Check admin session
export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("admin_session")?.value;

        if (!sessionToken) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const session = JSON.parse(
            Buffer.from(sessionToken, "base64").toString()
        );

        // Check expiration
        if (session.exp < Date.now()) {
            cookieStore.delete("admin_session");
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            admin: {
                email: session.email,
                name: session.name,
                role: session.role,
            },
        });
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
