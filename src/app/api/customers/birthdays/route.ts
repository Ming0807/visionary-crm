import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Get customers with upcoming birthdays (with notification channel info)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const daysAhead = parseInt(searchParams.get("days") || "7");

        // Get all customers with birthdays and their social identities
        const { data: customers, error } = await supabase
            .from("customers")
            .select(`
                id, name, phone, email, birthday, tier, points, total_spent,
                social_identities(platform, social_user_id)
            `)
            .not("birthday", "is", null);

        if (error) throw error;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingBirthdays: Array<{
            id: string;
            name: string;
            phone: string | null;
            email: string | null;
            birthday: string;
            tier: string;
            points: number;
            total_spent: number;
            daysUntil: number;
            birthdayDate: string;
            hasLine: boolean;
            hasEmail: boolean;
            channel: "line" | "email" | "none";
        }> = [];

        customers?.forEach((customer) => {
            if (!customer.birthday) return;

            const birthday = new Date(customer.birthday);
            birthday.setFullYear(today.getFullYear());
            birthday.setHours(0, 0, 0, 0);

            if (birthday < today) {
                birthday.setFullYear(today.getFullYear() + 1);
            }

            const diffTime = birthday.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays <= daysAhead) {
                // Check notification channels
                const hasLine = customer.social_identities?.some(
                    (s: { platform: string }) => s.platform === "line"
                ) || false;
                const hasEmail = !!customer.email;

                upcomingBirthdays.push({
                    id: customer.id,
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email,
                    birthday: customer.birthday,
                    tier: customer.tier,
                    points: customer.points,
                    total_spent: customer.total_spent,
                    daysUntil: diffDays,
                    birthdayDate: birthday.toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                    }),
                    hasLine,
                    hasEmail,
                    channel: hasLine ? "line" : hasEmail ? "email" : "none",
                });
            }
        });

        // Sort by days until birthday
        upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);

        // Count by channel
        const channelCounts = {
            line: upcomingBirthdays.filter(c => c.channel === "line").length,
            email: upcomingBirthdays.filter(c => c.channel === "email").length,
            none: upcomingBirthdays.filter(c => c.channel === "none").length,
        };

        return NextResponse.json({
            success: true,
            count: upcomingBirthdays.length,
            daysAhead,
            channelCounts,
            customers: upcomingBirthdays,
        });
    } catch (error) {
        console.error("Birthday query error:", error);
        return NextResponse.json({ error: "Failed to get birthdays" }, { status: 500 });
    }
}
