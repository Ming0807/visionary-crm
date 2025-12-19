import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

const replySchema = z.object({
    subject: z.string().min(1, "Subject is required").max(255),
    message: z.string().min(1, "Message is required").max(5000),
    linkUrl: z.string().url().optional().or(z.literal("")),
    linkText: z.string().max(100).optional(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validate input
        const validationResult = replySchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const { subject, message, linkUrl, linkText } = validationResult.data;

        // Get the contact message
        const { data: contactMessage, error: fetchError } = await supabase
            .from("contact_messages")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !contactMessage) {
            return NextResponse.json(
                { error: "Message not found" },
                { status: 404 }
            );
        }

        // Check if customer has email
        if (!contactMessage.email) {
            return NextResponse.json(
                { error: "ลูกค้าไม่ได้ระบุอีเมล ไม่สามารถส่งอีเมลตอบกลับได้" },
                { status: 400 }
            );
        }

        // Send email reply
        const emailResult = await sendEmail({
            to: contactMessage.email,
            type: "contact_reply",
            data: {
                subject,
                message,
                customerName: contactMessage.name,
                originalMessage: contactMessage.message.length > 200
                    ? contactMessage.message.substring(0, 200) + "..."
                    : contactMessage.message,
                linkUrl: linkUrl || undefined,
                linkText: linkText || undefined,
            },
        });

        if (!emailResult.success) {
            return NextResponse.json(
                { error: "Failed to send email", details: emailResult.error },
                { status: 500 }
            );
        }

        // Update message status to replied
        const { error: updateError } = await supabase
            .from("contact_messages")
            .update({
                status: "replied",
                replied_at: new Date().toISOString(),
                admin_notes: `ตอบกลับทางอีเมล: ${subject}\n\n${message}${linkUrl ? `\n\nLink: ${linkUrl}` : ""}`,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (updateError) {
            console.error("Error updating message status:", updateError);
            // Email was sent successfully, so don't fail the request
        }

        return NextResponse.json({
            success: true,
            message: "Reply sent successfully",
            emailId: emailResult.data?.messageId,
        });
    } catch (error) {
        console.error("Reply API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
