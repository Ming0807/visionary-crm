"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console in development
        console.error("Admin Error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
            <div className="bg-card rounded-2xl border border-border p-8 max-w-md text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                    เกิดข้อผิดพลาด
                </h2>
                <p className="text-muted-foreground mb-6">
                    {error.message || "Something went wrong. Please try again."}
                </p>
                <div className="flex gap-3 justify-center">
                    <Button onClick={reset} variant="default">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        ลองใหม่
                    </Button>
                    <Button variant="outline" asChild>
                        <a href="/admin">
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </a>
                    </Button>
                </div>
                {process.env.NODE_ENV === "development" && error.digest && (
                    <p className="text-xs text-muted-foreground mt-4 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
