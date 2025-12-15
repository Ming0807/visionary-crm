import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Fetch chat messages for a customer
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get("customerId");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        if (!customerId) {
            // Get all conversations (grouped by customer)
            const { data: conversations, error } = await supabase
                .from("chat_logs")
                .select(`
          customer_id,
          platform,
          direction,
          content,
          created_at,
          is_read,
          customer:customers(
            id,
            name,
            phone
          )
        `)
                .order("created_at", { ascending: false });

            if (error) {
                return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
            }

            // Group by customer
            const groupedMap = new Map<string, {
                customer: unknown;
                lastMessage: string;
                lastMessageAt: string;
                unreadCount: number;
                platform: string;
            }>();

            conversations?.forEach((msg) => {
                const cid = msg.customer_id;
                if (!cid) return;

                const existing = groupedMap.get(cid);
                if (!existing) {
                    groupedMap.set(cid, {
                        customer: msg.customer,
                        lastMessage: msg.content || "",
                        lastMessageAt: msg.created_at,
                        unreadCount: msg.direction === "inbound" && !msg.is_read ? 1 : 0,
                        platform: msg.platform,
                    });
                } else if (msg.direction === "inbound" && !msg.is_read) {
                    existing.unreadCount++;
                }
            });

            const grouped = Array.from(groupedMap.entries()).map(([customerId, data]) => ({
                customerId,
                ...data,
            }));

            return NextResponse.json(grouped);
        }

        // Get messages for specific customer
        const { data: messages, error } = await supabase
            .from("chat_logs")
            .select("*")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
        }

        // Mark as read
        await supabase
            .from("chat_logs")
            .update({ is_read: true })
            .eq("customer_id", customerId)
            .eq("direction", "inbound")
            .eq("is_read", false);

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
