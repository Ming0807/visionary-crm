"use client";

import { useRealtimeNotifications } from "@/hooks/use-realtime";
import { useRouter } from "next/navigation";

/**
 * RealtimeProvider - Wrapper component for admin pages to enable realtime notifications
 * Add to any admin page layout to receive toast notifications for new orders, messages, and stock alerts
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    // Enable realtime notifications with auto-refresh on new orders
    useRealtimeNotifications({
        onNewOrder: () => {
            // Optionally refresh the page when a new order comes in
            // router.refresh();
        },
        onNewMessage: () => {
            // Could navigate to inbox or show indicator
        },
        enableSound: true,
    });

    return <>{children}</>;
}
