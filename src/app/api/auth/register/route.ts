import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";

// POST - Register new customer with email/password
export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: "กรุณากรอก email และ password" },
                { status: 400 }
            );
        }

        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: "กรุณากรอกชื่อ (อย่างน้อย 2 ตัวอักษร)" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "รูปแบบ email ไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        // Validate password strength (min 6 chars)
        if (password.length < 6) {
            return NextResponse.json(
                { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const { data: existing } = await supabase
            .from("customers")
            .select("id")
            .eq("email", email.toLowerCase())
            .single();

        if (existing) {
            return NextResponse.json(
                { error: "Email นี้ถูกใช้งานแล้ว" },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create customer
        const { data: customer, error: insertError } = await supabase
            .from("customers")
            .insert({
                name: name.trim(),
                email: email.toLowerCase(),
                password_hash: passwordHash,
                profile_status: "incomplete",
                tier: "bronze",
                points: 0,
                total_spent: 0,
                order_count: 0,
            })
            .select()
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            return NextResponse.json(
                { error: "ไม่สามารถสร้างบัญชีได้" },
                { status: 500 }
            );
        }

        // Create session token (simple implementation)
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

        // Send welcome email (async, don't wait)
        sendEmail({
            to: customer.email,
            type: "welcome",
            data: { name: customer.name },
        }).catch(console.error);

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
                profileStatus: "incomplete",
                birthday: customer.birthday,
                address_json: customer.address_json,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
            { status: 500 }
        );
    }
}
