"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
        
        // You can log to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            เกิดข้อผิดพลาด
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            ขออภัย มีบางอย่างผิดพลาด กรุณาลองอีกครั้ง
                        </p>
                        
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                                <p className="text-sm font-mono text-red-800 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        
                        <div className="flex gap-3 justify-center">
                            <Button onClick={this.handleRetry} variant="default">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                ลองอีกครั้ง
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/">
                                    <Home className="h-4 w-4 mr-2" />
                                    หน้าหลัก
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook for functional components
export function useErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null);

    const handleError = React.useCallback((error: Error) => {
        console.error("Error handled:", error);
        setError(error);
    }, []);

    const clearError = React.useCallback(() => {
        setError(null);
    }, []);

    return { error, handleError, clearError };
}

// Simple error fallback component
export function ErrorFallback({ 
    error, 
    onRetry,
    className = ""
}: { 
    error?: Error; 
    onRetry?: () => void;
    className?: string;
}) {
    return (
        <div className={`p-6 text-center ${className}`}>
            <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-3" />
            <p className="text-muted-foreground mb-4">
                {error?.message || "เกิดข้อผิดพลาด"}
            </p>
            {onRetry && (
                <Button onClick={onRetry} size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    ลองอีกครั้ง
                </Button>
            )}
        </div>
    );
}
