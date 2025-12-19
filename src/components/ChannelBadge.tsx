"use client";

import { MessageSquare, Mail, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChannelBadgeProps {
    channel: "line" | "email" | "none";
    size?: "sm" | "md";
}

export function ChannelBadge({ channel, size = "sm" }: ChannelBadgeProps) {
    const sizeClasses = size === "sm" ? "text-xs py-0.5 px-2" : "text-sm py-1 px-3";
    const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

    if (channel === "line") {
        return (
            <Badge 
                variant="outline" 
                className={`${sizeClasses} border-green-500 text-green-600 bg-green-50`}
            >
                <MessageSquare className={`${iconSize} mr-1`} />
                LINE
            </Badge>
        );
    }

    if (channel === "email") {
        return (
            <Badge 
                variant="outline" 
                className={`${sizeClasses} border-blue-500 text-blue-600 bg-blue-50`}
            >
                <Mail className={`${iconSize} mr-1`} />
                Email
            </Badge>
        );
    }

    return (
        <Badge 
            variant="outline" 
            className={`${sizeClasses} border-gray-400 text-gray-500 bg-gray-50`}
        >
            <AlertCircle className={`${iconSize} mr-1`} />
            ไม่มีช่องทาง
        </Badge>
    );
}

interface ChannelSummaryProps {
    customers: Array<{ channel: "line" | "email" | "none" }>;
    selectedIds?: string[];
    allCustomers?: Array<{ id: string; channel: "line" | "email" | "none" }>;
}

export function ChannelSummary({ customers, selectedIds, allCustomers }: ChannelSummaryProps) {
    // If selectedIds and allCustomers are provided, filter to selected only
    const filteredCustomers = selectedIds && allCustomers
        ? allCustomers.filter(c => selectedIds.includes(c.id))
        : customers;

    const lineCount = filteredCustomers.filter(c => c.channel === "line").length;
    const emailCount = filteredCustomers.filter(c => c.channel === "email").length;
    const noneCount = filteredCustomers.filter(c => c.channel === "none").length;
    const total = filteredCustomers.length;

    if (total === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm">
            <span className="font-medium text-gray-700">สรุปช่องทาง:</span>
            
            {lineCount > 0 && (
                <div className="flex items-center gap-1.5 text-green-600">
                    <MessageSquare className="h-4 w-4" />
                    <span>{lineCount} LINE</span>
                </div>
            )}
            
            {emailCount > 0 && (
                <div className="flex items-center gap-1.5 text-blue-600">
                    <Mail className="h-4 w-4" />
                    <span>{emailCount} Email</span>
                </div>
            )}
            
            {noneCount > 0 && (
                <div className="flex items-center gap-1.5 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{noneCount} ไม่มีช่องทาง</span>
                </div>
            )}

            <span className="text-gray-400">|</span>
            <span className="text-gray-600">รวม {total} คน</span>
        </div>
    );
}

interface SendButtonSummaryProps {
    selectedCustomers: Array<{ id: string; channel: "line" | "email" | "none" }>;
    selectedIds: string[];
}

export function SendButtonSummary({ selectedCustomers, selectedIds }: SendButtonSummaryProps) {
    const selected = selectedCustomers.filter(c => selectedIds.includes(c.id));
    const lineCount = selected.filter(c => c.channel === "line").length;
    const emailCount = selected.filter(c => c.channel === "email").length;
    const noneCount = selected.filter(c => c.channel === "none").length;
    const canSend = lineCount + emailCount;

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 text-sm">
                {lineCount > 0 && (
                    <span className="flex items-center gap-1 text-green-600">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {lineCount} คน ผ่าน LINE
                    </span>
                )}
                {emailCount > 0 && (
                    <span className="flex items-center gap-1 text-blue-600">
                        <Mail className="h-3.5 w-3.5" />
                        {emailCount} คน ผ่าน Email
                    </span>
                )}
                {noneCount > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {noneCount} คน ส่งไม่ได้
                    </span>
                )}
            </div>
            {canSend > 0 && (
                <p className="text-xs text-gray-500">
                    จะส่งได้ {canSend} จาก {selected.length} คนที่เลือก
                </p>
            )}
        </div>
    );
}
