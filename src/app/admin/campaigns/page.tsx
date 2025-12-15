"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
    Plus, 
    Send, 
    Megaphone, 
    Calendar, 
    Users, 
    Play, 
    Pause, 
    BarChart3,
    Gift,
    Clock,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Campaign {
    id: string;
    name: string;
    description: string | null;
    campaign_type: string;
    status: string;
    message_template: string;
    schedule_type: string;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    last_run_at: string | null;
    created_at: string;
    coupons?: {
        code: string;
        discount_type: string;
        discount_value: number;
    };
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    birthday: { label: "Birthday", icon: <Gift className="h-4 w-4" />, color: "bg-pink-100 text-pink-700" },
    re_engagement: { label: "Re-engagement", icon: <RefreshCw className="h-4 w-4" />, color: "bg-blue-100 text-blue-700" },
    point_expiration: { label: "Point Expiration", icon: <Clock className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-700" },
    promotion: { label: "Promotion", icon: <Megaphone className="h-4 w-4" />, color: "bg-green-100 text-green-700" },
    custom: { label: "Custom", icon: <Send className="h-4 w-4" />, color: "bg-gray-100 text-gray-700" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
    active: { label: "Active", color: "bg-green-100 text-green-700" },
    paused: { label: "Paused", color: "bg-yellow-100 text-yellow-700" },
    completed: { label: "Completed", color: "bg-blue-100 text-blue-700" },
};

export default function AdminCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState<string | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch("/api/campaigns");
            const data = await res.json();
            setCampaigns(data || []);
        } catch (error) {
            console.error("Failed to fetch campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const runCampaign = async (campaignId: string, testMode = false) => {
        setRunning(campaignId || "test");
        try {
            const res = await fetch("/api/campaigns/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campaignId: campaignId || null, testMode }),
            });
            const result = await res.json();
            alert(`${testMode ? "[TEST] " : ""}Sent to ${result.sent} customers!`);
            fetchCampaigns();
        } catch (error) {
            alert("Failed to run campaign");
        } finally {
            setRunning(null);
        }
    };

    const toggleStatus = async (campaign: Campaign) => {
        const newStatus = campaign.status === "active" ? "paused" : "active";
        await fetch("/api/campaigns", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: campaign.id, status: newStatus }),
        });
        fetchCampaigns();
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

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="grid gap-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-48 bg-muted rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
                    <p className="text-muted-foreground">
                        Automated marketing campaigns
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/campaigns/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Campaign
                    </Link>
                </Button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card 
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors border-2 border-green-200 bg-green-50" 
                    onClick={() => runCampaign("", true)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <Send className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-green-700">🧪 Test Send All</p>
                            <p className="text-xs text-green-600">Send to ALL LINE users</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => runCampaign("")}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                            <Gift className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Birthday Check</p>
                            <p className="text-xs text-muted-foreground">Send today's wishes</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <RefreshCw className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Re-engage</p>
                            <p className="text-xs text-muted-foreground">Inactive customers</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{campaigns.filter(c => c.status === "active").length}</p>
                            <p className="text-xs text-muted-foreground">Active campaigns</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <Send className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{campaigns.reduce((sum, c) => sum + c.total_sent, 0)}</p>
                            <p className="text-xs text-muted-foreground">Total sent</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Campaigns List */}
            {campaigns.length > 0 ? (
                <div className="grid gap-4">
                    {campaigns.map((campaign) => {
                        const type = TYPE_CONFIG[campaign.campaign_type] || TYPE_CONFIG.custom;
                        const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                        return (
                            <Card key={campaign.id} className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${type.color}`}>
                                            {type.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{campaign.name}</h3>
                                                <Badge className={status.color}>{status.label}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {campaign.description || campaign.message_template.slice(0, 60) + "..."}
                                            </p>
                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {campaign.schedule_type}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Send className="h-3 w-3" />
                                                    {campaign.total_sent} sent
                                                </span>
                                                {campaign.last_run_at && (
                                                    <span>Last run: {formatDate(campaign.last_run_at)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleStatus(campaign)}
                                        >
                                            {campaign.status === "active" ? (
                                                <>
                                                    <Pause className="h-4 w-4 mr-1" />
                                                    Pause
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-4 w-4 mr-1" />
                                                    Activate
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => runCampaign(campaign.id)}
                                            disabled={running === campaign.id}
                                        >
                                            {running === campaign.id ? (
                                                "Sending..."
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-1" />
                                                    Run Now
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Create your first automated marketing campaign
                    </p>
                    <Button asChild>
                        <Link href="/admin/campaigns/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Campaign
                        </Link>
                    </Button>
                </Card>
            )}
        </div>
    );
}
