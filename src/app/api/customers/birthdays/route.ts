import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Get customers with upcoming birthdays
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const daysAhead = parseInt(searchParams.get("days") || "7");

        // Get all customers with birthdays
        const { data: customers, error } = await supabase
            .from("customers")
            .select("id, name, phone, email, birthday, tier, points, total_spent")
            .not("birthday", "is", null);

        if (error) throw error;

        const today = new Date();
        // Reset to midnight for accurate day comparison
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
        }> = [];

        // Debug info
        const debugInfo: Array<{ name: string; birthday: string; calculatedDays: number; included: boolean }> = [];

        customers?.forEach((customer) => {
            if (!customer.birthday) return;

            const birthday = new Date(customer.birthday);
            // Set birthday to this year for comparison
            birthday.setFullYear(today.getFullYear());
            birthday.setHours(0, 0, 0, 0);

            // If birthday already passed this year, check next year
            if (birthday < today) {
                birthday.setFullYear(today.getFullYear() + 1);
            }

            const diffTime = birthday.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            debugInfo.push({
                name: customer.name || "Unknown",
                birthday: customer.birthday,
                calculatedDays: diffDays,
                included: diffDays >= 0 && diffDays <= daysAhead
            });

            if (diffDays >= 0 && diffDays <= daysAhead) {
                upcomingBirthdays.push({
                    ...customer,
                    daysUntil: diffDays,
                    birthdayDate: birthday.toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                    }),
                });
            }
        });

        // Sort by days until birthday
        upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);

        // Format LINE message
        let lineMessage = `🎂 วันเกิดลูกค้าใน ${daysAhead} วันข้างหน้า\n\n`;

        if (upcomingBirthdays.length === 0) {
            lineMessage += "ไม่มีลูกค้าที่มีวันเกิดในช่วงนี้";
        } else {
            upcomingBirthdays.forEach((c) => {
                const dayText = c.daysUntil === 0 ? "วันนี้! 🎉" : `อีก ${c.daysUntil} วัน`;
                lineMessage += `• ${c.name || "ไม่ระบุชื่อ"} (${c.birthdayDate}) - ${dayText}\n`;
            });
        }

        return NextResponse.json({
            success: true,
            count: upcomingBirthdays.length,
            daysAhead,
            serverTime: today.toISOString(),
            customers: upcomingBirthdays,
            lineMessage,
            debug: debugInfo,
        });
    } catch (error) {
        console.error("Birthday query error:", error);
        return NextResponse.json({ error: "Failed to get birthdays" }, { status: 500 });
    }
}
