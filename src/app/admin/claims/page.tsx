"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Claim {
    id: string;
    claim_type: string;
    status: string;
    reason: string;
    order_id: string | null;
    customer_id: string;
    resolution_notes: string | null;
    created_at: string;
    updated_at: string;
    customer?: {
        name: string | null;
        email: string | null;
    };
    order?: {
        order_number: string;
    };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3 w-3" /> },
    in_review: { label: "In Review", color: "bg-blue-100 text-blue-700", icon: <Eye className="h-3 w-3" /> },
    approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: <XCircle className="h-3 w-3" /> },
    resolved: { label: "Resolved", color: "bg-gray-100 text-gray-700", icon: <CheckCircle className="h-3 w-3" /> },
};

const CLAIM_TYPE_LABELS: Record<string, string> = {
    return: "Return",
    exchange: "Exchange",
    refund: "Refund",
    warranty: "Warranty",
    complaint: "Complaint",
};

export default function AdminClaimsPage() {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const res = await fetch("/api/claims");
            if (res.ok) {
                const data = await res.json();
                setClaims(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch claims:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredClaims = claims.filter((claim) => {
        if (filter === "all") return true;
        return claim.status === filter;
    });

    const statusCounts = claims.reduce((acc, claim) => {
        acc[claim.status] = (acc[claim.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="h-64 bg-muted rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Claims & Returns</h1>
                <p className="text-muted-foreground">
                    Manage customer claims, returns, and warranty requests
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Card
                    className={`p-4 cursor-pointer transition-colors ${filter === "all" ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setFilter("all")}
                >
                    <p className="text-sm text-muted-foreground">All Claims</p>
                    <p className="text-2xl font-bold">{claims.length}</p>
                </Card>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <Card
                        key={status}
                        className={`p-4 cursor-pointer transition-colors ${filter === status ? "ring-2 ring-primary" : ""}`}
                        onClick={() => setFilter(status)}
                    >
                        <p className="text-sm text-muted-foreground">{config.label}</p>
                        <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
                    </Card>
                ))}
            </div>

            {/* Claims Table */}
            <Card>
                {filteredClaims.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Claim ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClaims.map((claim) => {
                                const status = STATUS_CONFIG[claim.status] || STATUS_CONFIG.pending;
                                return (
                                    <TableRow key={claim.id}>
                                        <TableCell className="font-mono text-sm">
                                            {claim.id.slice(0, 8)}...
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {CLAIM_TYPE_LABELS[claim.claim_type] || claim.claim_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {claim.customer?.name || "Unknown"}
                                        </TableCell>
                                        <TableCell>
                                            {claim.order ? (
                                                <Link
                                                    href={`/admin/orders/${claim.order_id}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {claim.order.order_number}
                                                </Link>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {claim.reason}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${status.color} gap-1`}>
                                                {status.icon}
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                            {formatDate(claim.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={`/admin/claims/${claim.id}`}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    ดู
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No claims found</h3>
                        <p className="text-muted-foreground">
                            {filter === "all"
                                ? "Claims will appear here when customers submit them"
                                : `No ${filter} claims at the moment`}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
