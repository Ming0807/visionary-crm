"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface RealtimeOptions {
    onNewOrder?: (order: NewOrderPayload) => void;
    onNewMessage?: (message: NewMessagePayload) => void;
    onLowStock?: (alert: LowStockPayload) => void;
    enableSound?: boolean;
}

interface NewOrderPayload {
    id: string;
    order_number: string;
    total_amount: number;
    customer_id: string;
    created_at: string;
}

interface NewMessagePayload {
    id: string;
    conversation_id: string;
    content: string;
    sender_type: string;
    created_at: string;
}

interface LowStockPayload {
    variant_id: string;
    sku: string;
    quantity: number;
}

// Play notification sound
function playNotificationSound() {
    try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch(() => {
            // Ignore if autoplay blocked
        });
    } catch {
        // Ignore audio errors
    }
}

export function useRealtimeNotifications(options: RealtimeOptions = {}) {
    const { toast } = useToast();
    const { onNewOrder, onNewMessage, onLowStock, enableSound = true } = options;
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    const showNotification = useCallback((title: string, description: string, variant: "default" | "destructive" = "default") => {
        toast({ title, description, variant });
        if (enableSound) {
            playNotificationSound();
        }
    }, [toast, enableSound]);

    useEffect(() => {
        // Create a single channel for all subscriptions
        const channel = supabase.channel("admin-notifications");

        // Subscribe to new orders
        channel.on<NewOrderPayload>(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "orders",
            },
            (payload) => {
                const order = payload.new;
                showNotification(
                    "🛒 คำสั่งซื้อใหม่!",
                    `Order #${order.order_number} - ฿${order.total_amount?.toLocaleString()}`
                );
                onNewOrder?.(order);
            }
        );

        // Subscribe to new messages (customer messages only)
        channel.on<NewMessagePayload>(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: "sender_type=eq.customer",
            },
            (payload) => {
                const message = payload.new;
                showNotification(
                    "💬 ข้อความใหม่จากลูกค้า",
                    message.content?.slice(0, 50) + (message.content?.length > 50 ? "..." : "")
                );
                onNewMessage?.(message);
            }
        );

        // Subscribe to low stock alerts (inventory updates where quantity < 5)
        channel.on<LowStockPayload>(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "inventory",
            },
            (payload) => {
                const inventory = payload.new;
                if (inventory.quantity !== undefined && inventory.quantity < 5) {
                    showNotification(
                        "⚠️ สินค้าใกล้หมด!",
                        `SKU: ${inventory.sku || "Unknown"} - เหลือ ${inventory.quantity} ชิ้น`,
                        "destructive"
                    );
                    onLowStock?.(inventory);
                }
            }
        );

        // Subscribe to the channel
        channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                console.log("Realtime notifications connected");
            }
        });

        channelRef.current = channel;

        // Cleanup on unmount
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [onNewOrder, onNewMessage, onLowStock, showNotification]);

    return {
        isConnected: !!channelRef.current,
    };
}

// Simple hook just for new orders
export function useNewOrderNotifications(callback?: (order: NewOrderPayload) => void) {
    return useRealtimeNotifications({
        onNewOrder: callback,
        enableSound: true,
    });
}
