import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// POST - Login with email/password
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: "กรุณากรอก email และ password" },
                { status: 400 }
            );
        }

        // Find customer by email
        const { data: customer, error } = await supabase
            .from("customers")
            .select("*")
            .eq("email", email.toLowerCase())
            .single();

        if (error || !customer) {
            return NextResponse.json(
                { error: "Email หรือ password ไม่ถูกต้อง" },
                { status: 401 }
            );
        }

        // Check if customer has password (registered with email)
        if (!customer.password_hash) {
            return NextResponse.json(
                { error: "บัญชีนี้ใช้ LINE Login กรุณาเข้าสู่ระบบด้วย LINE" },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, customer.password_hash);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Email หรือ password ไม่ถูกต้อง" },
                { status: 401 }
            );
        }

        // Create session token
        const sessionToken = `${customer.id}:${Date.now()}:${Math.random().toString(36).substring(2)}`;
        const encodedToken = Buffer.from(sessionToken).toString("base64");

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set("customer_session", encodedToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        // Determine profile status
        const profileStatus = customer.phone && customer.address_json
            ? "complete"
            : "incomplete";

        return NextResponse.json({
            success: true,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                profileImageUrl: customer.profile_image_url,
                tier: customer.tier,
                points: customer.points,
                profileStatus,
                birthday: customer.birthday,
                address_json: customer.address_json,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
            { status: 500 }
        );
    }
}
