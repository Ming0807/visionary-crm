"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html lang="th">
            <body className="bg-background text-foreground">
                <div className="flex flex-col items-center justify-center min-h-screen p-6">
                    <div className="bg-card rounded-2xl border border-border p-8 max-w-md text-center">
                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            เกิดข้อผิดพลาด
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            ขออภัย เกิดข้อผิดพลาดขึ้น กรุณาลองใหม่อีกครั้ง
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={reset} variant="default" size="lg">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                ลองใหม่
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <a href="/">
                                    <Home className="h-4 w-4 mr-2" />
                                    หน้าแรก
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
