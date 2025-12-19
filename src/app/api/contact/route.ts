import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 requests
const RATE_WINDOW = 60 * 1000; // per minute

// Validation schema
const contactSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    phone: z.string().min(9, "Invalid phone").max(20),
    email: z.string().email().optional().or(z.literal("")),
    subject: z.enum(["product", "order", "warranty", "other"]),
    message: z.string().min(10, "Message too short").max(2000),
});

function getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }
    return "unknown";
}

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT) {
        return false;
    }

    record.count++;
    return true;
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientIP = getClientIP(request);
        if (!checkRateLimit(clientIP)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validationResult = contactSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const { name, phone, email, subject, message } = validationResult.data;

        // Insert into database
        const { data, error } = await supabase
            .from("contact_messages")
            .insert({
                name,
                phone,
                email: email || null,
                subject,
                message,
                status: "new",
            })
            .select()
            .single();

        if (error) {
            console.error("Error inserting contact message:", error);
            return NextResponse.json(
                { error: "Failed to save message" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Message sent successfully",
            id: data.id,
        });
    } catch (error) {
        console.error("Contact API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
