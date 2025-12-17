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
    customer_id: string;
    platform: string;
    direction: string;
    content: string;
    is_read: boolean;
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
        // Use Web Audio API for more reliable playback
        if (typeof window !== "undefined" && "AudioContext" in window) {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = "sine";
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
        }
    } catch {
        // Ignore audio errors
    }
}

export function useRealtimeNotifications(options: RealtimeOptions = {}) {
    const { toast } = useToast();
    const { enableSound = true } = options;
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    
    // Use refs to store callbacks - will be updated without recreating subscription
    const onNewOrderRef = useRef(options.onNewOrder);
    const onNewMessageRef = useRef(options.onNewMessage);
    const onLowStockRef = useRef(options.onLowStock);
    const enableSoundRef = useRef(enableSound);
    
    // Update refs when callbacks change
    useEffect(() => {
        onNewOrderRef.current = options.onNewOrder;
        onNewMessageRef.current = options.onNewMessage;
        onLowStockRef.current = options.onLowStock;
        enableSoundRef.current = enableSound;
    }, [options.onNewOrder, options.onNewMessage, options.onLowStock, enableSound]);

    const showNotification = useCallback((title: string, description: string, variant: "default" | "destructive" = "default") => {
        toast({ title, description, variant });
        if (enableSoundRef.current) {
            playNotificationSound();
        }
    }, [toast]);

    useEffect(() => {
        // Don't create if already exists
        if (channelRef.current) {
            return;
        }
        
        console.log("Creating realtime subscription...");
        
        // Create a single channel for all subscriptions
        const channel = supabase.channel(`admin-notifications-${Date.now()}`);

        // Subscribe to new orders
        channel.on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "orders",
            },
            (payload) => {
                const order = payload.new as NewOrderPayload;
                showNotification(
                    "🛒 คำสั่งซื้อใหม่!",
                    `Order #${order.order_number} - ฿${order.total_amount?.toLocaleString()}`
                );
                onNewOrderRef.current?.(order);
            }
        );

        // Subscribe to new messages (inbound only)
        channel.on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "chat_logs",
                filter: "direction=eq.inbound",
            },
            (payload) => {
                const message = payload.new as NewMessagePayload;
                console.log("Realtime: New message received:", message.id);
                
                showNotification(
                    "💬 ข้อความใหม่จากลูกค้า",
                    message.content?.slice(0, 50) + (message.content?.length > 50 ? "..." : "")
                );
                onNewMessageRef.current?.(message);
            }
        );

        // Subscribe to low stock alerts
        channel.on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "inventory",
            },
            (payload) => {
                const inventory = payload.new as LowStockPayload;
                if (inventory.quantity !== undefined && inventory.quantity < 5) {
                    showNotification(
                        "⚠️ สินค้าใกล้หมด!",
                        `SKU: ${inventory.sku || "Unknown"} - เหลือ ${inventory.quantity} ชิ้น`,
                        "destructive"
                    );
                    onLowStockRef.current?.(inventory);
                }
            }
        );

        // Subscribe to the channel
        channel.subscribe((status) => {
            console.log("Realtime subscription status:", status);
        });

        channelRef.current = channel;

        // Cleanup on unmount
        return () => {
            console.log("Cleaning up realtime subscription");
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [showNotification]);

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
