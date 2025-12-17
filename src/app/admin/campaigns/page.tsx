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
    RefreshCw,
    Edit
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

interface BirthdayCustomer {
    id: string;
    name: string | null;
    phone: string | null;
    birthday: string;
    daysUntil: number;
    birthdayDate: string;
    tier: string;
    total_spent: number;
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
    const [birthdays, setBirthdays] = useState<BirthdayCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState<string | null>(null);
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [sendMessage, setSendMessage] = useState("🎂 สุขสันต์วันเกิดครับ/ค่ะ คุณ{{name}}! รับส่วนลดพิเศษ 10% วันนี้เท่านั้น!");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchCampaigns();
        fetchBirthdays();
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

    const fetchBirthdays = async () => {
        try {
            const res = await fetch("/api/customers/birthdays?days=7");
            const data = await res.json();
            setBirthdays(data.customers || []);
        } catch (error) {
            console.error("Failed to fetch birthdays:", error);
        }
    };

    const toggleCustomerSelection = (customerId: string) => {
        setSelectedCustomers(prev => 
            prev.includes(customerId) 
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
        );
    };

    const selectAllBirthdays = () => {
        setSelectedCustomers(birthdays.map(b => b.id));
    };

    const clearSelection = () => {
        setSelectedCustomers([]);
    };

    const sendToSelected = async () => {
        if (selectedCustomers.length === 0) {
            alert("กรุณาเลือกลูกค้าก่อน");
            return;
        }
        setSending(true);
        try {
            const res = await fetch("/api/campaigns/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerIds: selectedCustomers,
                    message: sendMessage
                })
            });
            const result = await res.json();
            alert(`ส่งสำเร็จ ${result.sent} / ${result.total} คน`);
            setSelectedCustomers([]);
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการส่ง");
            console.error(error);
        } finally {
            setSending(false);
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

            {/* Birthday Section */}
            {birthdays.length > 0 && (
                <Card className="p-6 mb-6 border-2 border-pink-200 bg-pink-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-pink-600" />
                            <h2 className="font-semibold text-pink-900">🎂 วันเกิดลูกค้าใน 7 วันข้างหน้า ({birthdays.length} คน)</h2>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={selectAllBirthdays}>
                                เลือกทั้งหมด
                            </Button>
                            {selectedCustomers.length > 0 && (
                                <Button variant="outline" size="sm" onClick={clearSelection}>
                                    ล้าง ({selectedCustomers.length})
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    {/* Customer List with Checkboxes */}
                    <div className="grid gap-3 mb-4">
                        {birthdays.map((customer) => (
                            <div 
                                key={customer.id} 
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                    selectedCustomers.includes(customer.id) 
                                        ? 'bg-pink-100 border-pink-300' 
                                        : 'bg-white hover:bg-pink-50'
                                }`}
                                onClick={() => toggleCustomerSelection(customer.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedCustomers.includes(customer.id)}
                                        onChange={() => toggleCustomerSelection(customer.id)}
                                        className="h-4 w-4 text-pink-600 rounded focus:ring-pink-500"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${customer.daysUntil === 0 ? 'bg-pink-500 text-white' : 'bg-pink-100'}`}>
                                        {customer.daysUntil === 0 ? '🎉' : '🎂'}
                                    </div>
                                    <div>
                                        <p className="font-medium">{customer.name || 'ไม่ระบุชื่อ'}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {customer.phone || '-'} • {customer.birthdayDate}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={customer.daysUntil === 0 ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700'}>
                                        {customer.daysUntil === 0 ? '🎉 วันนี้!' : `อีก ${customer.daysUntil} วัน`}
                                    </Badge>
                                    <Link href={`/admin/customers/${customer.id}`} onClick={(e) => e.stopPropagation()}>
                                        <Button variant="outline" size="sm">ดูโปรไฟล์</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message Input and Send Button */}
                    {selectedCustomers.length > 0 && (
                        <div className="border-t border-pink-200 pt-4 mt-4">
                            <label className="block text-sm font-medium text-pink-900 mb-2">
                                ข้อความอวยพร (ใช้ {"{{name}}"} สำหรับชื่อลูกค้า)
                            </label>
                            <textarea 
                                value={sendMessage}
                                onChange={(e) => setSendMessage(e.target.value)}
                                className="w-full p-3 border border-pink-200 rounded-lg mb-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                rows={3}
                            />
                            <Button 
                                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                                onClick={sendToSelected}
                                disabled={sending}
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {sending ? 'กำลังส่ง...' : `ส่งให้ ${selectedCustomers.length} คนที่เลือก`}
                            </Button>
                        </div>
                    )}
                </Card>
            )}

            {/* Campaigns List */}
            {campaigns.length > 0 ? (
                <div className="grid gap-4">
                    {campaigns.map((campaign) => {
                        const type = TYPE_CONFIG[campaign.campaign_type] || TYPE_CONFIG.custom;
                        const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                        const successRate = campaign.total_sent > 0 
                            ? Math.round((campaign.total_opened / campaign.total_sent) * 100) || 0
                            : 0;
                        return (
                            <Card key={campaign.id} className="overflow-hidden">
                                {/* Header with colored bar */}
                                <div className={`h-1 ${type.color.split(' ')[0]}`} />
                                
                                <div className="p-6">
                                    {/* Top Row: Icon, Name, Status, Actions */}
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${type.color}`}>
                                                {type.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                                                    <Badge className={status.color}>{status.label}</Badge>
                                                    <Badge variant="outline" className="text-xs">{type.label}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {campaign.description || 'ไม่มีคำอธิบาย'}
                                                </p>
                                                {campaign.coupons && (
                                                    <Badge variant="secondary" className="mt-2">
                                                        🎫 คูปอง: {campaign.coupons.code} ({campaign.coupons.discount_value}
                                                        {campaign.coupons.discount_type === 'percentage' ? '%' : '฿'})
                                                    </Badge>
                                                )}
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
                                                        หยุด
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="h-4 w-4 mr-1" />
                                                        เปิดใช้
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => runCampaign(campaign.id)}
                                                disabled={running === campaign.id}
                                                className="bg-orange-500 hover:bg-orange-600"
                                            >
                                                {running === campaign.id ? (
                                                    "กำลังส่ง..."
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4 mr-1" />
                                                        รันทันที
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    แก้ไข
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-foreground">{campaign.total_sent}</p>
                                            <p className="text-xs text-muted-foreground">ส่งแล้ว</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">{campaign.total_opened}</p>
                                            <p className="text-xs text-muted-foreground">เปิดอ่าน</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">{campaign.total_clicked}</p>
                                            <p className="text-xs text-muted-foreground">คลิก</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-600">{successRate}%</p>
                                            <p className="text-xs text-muted-foreground">อัตราเปิดอ่าน</p>
                                        </div>
                                    </div>

                                    {/* Message Preview */}
                                    <div className="mb-4">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">📝 ข้อความ:</p>
                                        <div className="p-3 bg-gray-50 rounded-lg border text-sm whitespace-pre-wrap">
                                            {campaign.message_template.slice(0, 150)}
                                            {campaign.message_template.length > 150 && '...'}
                                        </div>
                                    </div>

                                    {/* Bottom Row: Meta Info */}
                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            ตั้งเวลา: {campaign.schedule_type === 'manual' ? 'ส่งเอง' : campaign.schedule_type}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            สร้างเมื่อ: {formatDate(campaign.created_at)}
                                        </span>
                                        {campaign.last_run_at && (
                                            <span className="flex items-center gap-1">
                                                <Send className="h-3 w-3" />
                                                รันล่าสุด: {formatDate(campaign.last_run_at)}
                                            </span>
                                        )}
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
