import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ เรียกใช้ Library

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        // ✅ 1. ตั้งค่า Google Generative AI
        const genAI = new GoogleGenerativeAI(apiKey);

        // เลือกโมเดล (ใช้ชื่อสั้นๆ ได้เลย Library จะจัดการหาตัวจริงให้เอง)
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 200,
            }
        });

        const body = await request.json();
        const { customerId, customerMessage } = body;

        if (!customerMessage) {
            return NextResponse.json({ error: "Missing customer message" }, { status: 400 });
        }

        // --- ส่วนดึงข้อมูลลูกค้า (เหมือนเดิม) ---
        let customerContext = "";
        if (customerId) {
            const { data: customer } = await supabase
                .from("customers")
                .select("name, tier, points, total_spent")
                .eq("id", customerId)
                .single();

            if (customer) {
                customerContext = `
ข้อมูลลูกค้า:
- ชื่อ: ${customer.name || "ไม่ทราบชื่อ"}
- ระดับสมาชิก: ${customer.tier}
- แต้มสะสม: ${customer.points} คะแนน
- ยอดซื้อรวม: ${customer.total_spent} บาท
`;
            }

            const { data: recentChats } = await supabase
                .from("chat_logs")
                .select("direction, content, created_at")
                .eq("customer_id", customerId)
                .order("created_at", { ascending: false })
                .limit(5);

            if (recentChats && recentChats.length > 0) {
                const chatHistory = recentChats
                    .reverse()
                    .map(c => `${c.direction === "inbound" ? "ลูกค้า" : "เรา"}: ${c.content}`)
                    .join("\n");
                customerContext += `\nประวัติแชทล่าสุด:\n${chatHistory}`;
            }
        }
        // ------------------------------------

        // รวม Prompt
        const prompt = `คุณเป็นพนักงานขายของร้านแว่นตา "The Visionary" ที่ให้บริการลูกค้าผ่าน LINE Chat

ลักษณะการตอบ:
- สุภาพ เป็นมิตร ใช้คำลงท้ายครับ/ค่ะ
- กระชับ ไม่เกิน 2-3 ประโยค
- ถ้าเป็นคำถามเรื่องสินค้า ให้แนะนำอย่างมืออาชีพ
- ถ้าเป็นการนัดหมาย ให้เสนอเวลา
- ใช้ emoji เล็กน้อย 1-2 ตัว

${customerContext}

ข้อความล่าสุดจากลูกค้า: "${customerMessage}"

กรุณาเขียนข้อความตอบกลับ (ภาษาไทย):`;

        // ✅ 2. เรียกใช้งานผ่าน Library (Clean กว่ามาก)
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const suggestion = response.text(); // ดึงข้อความออกมา

            return NextResponse.json({
                suggestion: suggestion.trim(),
                customerContext: customerContext ? true : false
            });
        } catch (aiError: any) {
            console.error("Gemini Library Error:", aiError);
            return NextResponse.json({
                error: "AI service unavailable",
                details: aiError.message
            }, { status: 500 });
        }

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}