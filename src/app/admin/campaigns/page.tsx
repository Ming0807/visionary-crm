"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
    Plus, 
    Send, 
    Megaphone, 
    Calendar, 
    Users, 
    Play, 
    Pause, 
    Gift,
    Clock,
    RefreshCw,
    Edit,
    Mail,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Link2,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    email: string | null;
    birthday: string;
    daysUntil: number;
    birthdayDate: string;
    tier: string;
    total_spent: number;
    hasLine: boolean;
    hasEmail: boolean;
    channel: "line" | "email" | "none";
}

interface SendResult {
    success: boolean;
    sent: number;
    total: number;
    channels?: {
        line: number;
        email: number;
    };
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    birthday: { label: "Birthday", icon: <Gift className="h-4 w-4" />, color: "bg-primary/10 text-primary" },
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

// Premium Channel Badge Component
function ChannelBadge({ channel }: { channel: "line" | "email" | "none" }) {
    if (channel === "line") {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                <MessageSquare className="h-3.5 w-3.5" />
                LINE
            </span>
        );
    }
    if (channel === "email") {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                <Mail className="h-3.5 w-3.5" />
                Email
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm">
            <AlertCircle className="h-3.5 w-3.5" />
            ไม่มีช่องทาง
        </span>
    );
}

export default function AdminCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [birthdays, setBirthdays] = useState<BirthdayCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState<string | null>(null);
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [sendMessage, setSendMessage] = useState("🎂 สุขสันต์วันเกิดครับ/ค่ะ คุณ{{name}}!\n\nรับส่วนลดพิเศษ 10% สำหรับวันเกิดของคุณ");
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("ดูสินค้า");
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<SendResult | null>(null);

    // Calculate selection summary
    const selectionSummary = useMemo(() => {
        const selected = birthdays.filter(b => selectedCustomers.includes(b.id));
        return {
            total: selected.length,
            line: selected.filter(c => c.channel === "line").length,
            email: selected.filter(c => c.channel === "email").length,
            none: selected.filter(c => c.channel === "none").length,
            canSend: selected.filter(c => c.channel !== "none").length,
        };
    }, [selectedCustomers, birthdays]);

    useEffect(() => {
        fetchCampaigns();
        fetchBirthdays();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch("/api/campaigns");
            const data = await res.json();
            setCampaigns(Array.isArray(data) ? data : data.campaigns || []);
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
        setSendResult(null);
    };

    const selectAllBirthdays = () => {
        setSelectedCustomers(birthdays.map(b => b.id));
        setSendResult(null);
    };

    const selectOnlyCanSend = () => {
        setSelectedCustomers(birthdays.filter(b => b.channel !== "none").map(b => b.id));
        setSendResult(null);
    };

    const clearSelection = () => {
        setSelectedCustomers([]);
        setSendResult(null);
    };

    const sendToSelected = async () => {
        if (selectionSummary.canSend === 0) {
            alert("ไม่มีลูกค้าที่ส่งได้ (ต้องมี LINE หรือ Email)");
            return;
        }
        setSending(true);
        setSendResult(null);
        
        // Build message with link
        let finalMessage = sendMessage;
        if (linkUrl) {
            finalMessage += `\n\n🔗 ${linkText}: ${linkUrl}`;
        }
        
        try {
            const res = await fetch("/api/campaigns/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerIds: selectedCustomers,
                    message: finalMessage,
                    linkUrl: linkUrl || undefined,
                    linkText: linkText || undefined,
                })
            });
            const result = await res.json();
            setSendResult(result);
            if (result.success) {
                setSelectedCustomers([]);
            }
        } catch (error) {
            console.error(error);
            setSendResult({ success: false, sent: 0, total: selectedCustomers.length });
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
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
                    <p className="text-muted-foreground">
                        ส่งข้อความถึงลูกค้าผ่าน LINE หรือ Email
                    </p>
                </div>
                <Button asChild className="shadow-sm">
                    <Link href="/admin/campaigns/new">
                        <Plus className="h-4 w-4 mr-2" />
                        สร้าง Campaign
                    </Link>
                </Button>
            </div>

            {/* Quick Stats - Premium Style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-5 shadow-premium hover-lift">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-2xl">{campaigns.filter(c => c.status === "active").length}</p>
                            <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 shadow-premium hover-lift">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-accent/10">
                            <Send className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                            <p className="font-bold text-2xl">{campaigns.reduce((sum, c) => sum + c.total_sent, 0)}</p>
                            <p className="text-sm text-muted-foreground">ส่งแล้ว</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 shadow-premium hover-lift">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <Gift className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-2xl">{birthdays.filter(b => b.daysUntil === 0).length}</p>
                            <p className="text-sm text-muted-foreground">วันเกิดวันนี้</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 shadow-premium hover-lift">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-secondary">
                            <Calendar className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                            <p className="font-bold text-2xl">{birthdays.length}</p>
                            <p className="text-sm text-muted-foreground">ใน 7 วัน</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Birthday Section - Premium Design */}
            {birthdays.length > 0 && (
                <Card className="overflow-hidden shadow-premium">
                    {/* Header with brand gradient */}
                    <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Gift className="h-7 w-7" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-xl">🎂 วันเกิดลูกค้า</h2>
                                    <p className="text-primary-foreground/80 text-sm mt-1">
                                        ใน 7 วันข้างหน้า • {birthdays.length} คน
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{birthdays.filter(b => b.channel === "line").length} LINE</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                                    <Mail className="h-4 w-4" />
                                    <span>{birthdays.filter(b => b.channel === "email").length} Email</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Selection Actions */}
                        <div className="flex flex-wrap gap-3 mb-5">
                            <Button variant="outline" size="sm" onClick={selectAllBirthdays} className="rounded-full">
                                เลือกทั้งหมด
                            </Button>
                            <Button variant="outline" size="sm" onClick={selectOnlyCanSend} className="rounded-full border-green-300 text-green-700 hover:bg-green-50">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                เลือกเฉพาะที่ส่งได้
                            </Button>
                            {selectedCustomers.length > 0 && (
                                <Button variant="outline" size="sm" onClick={clearSelection} className="rounded-full border-red-300 text-red-600 hover:bg-red-50">
                                    <XCircle className="h-4 w-4 mr-1" />
                                    ล้าง ({selectedCustomers.length})
                                </Button>
                            )}
                        </div>

                        {/* Customer List - Premium Style */}
                        <div className="border rounded-2xl divide-y overflow-hidden max-h-[400px] overflow-y-auto">
                            {birthdays.map((customer) => (
                                <div 
                                    key={customer.id} 
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 cursor-pointer transition-all hover:bg-secondary/50 gap-2 sm:gap-0 ${
                                        selectedCustomers.includes(customer.id) ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                                    }`}
                                    onClick={() => toggleCustomerSelection(customer.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Checkbox */}
                                        <input 
                                            type="checkbox" 
                                            checked={selectedCustomers.includes(customer.id)}
                                            onChange={() => toggleCustomerSelection(customer.id)}
                                            className="h-5 w-5 text-primary rounded-md focus:ring-primary border-2 shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-sm shrink-0 ${
                                            customer.daysUntil === 0 
                                                ? 'bg-gradient-to-br from-primary to-accent text-white' 
                                                : 'bg-secondary'
                                        }`}>
                                            {customer.daysUntil === 0 ? '🎉' : '🎂'}
                                        </div>
                                        
                                        {/* Info */}
                                        <div className="min-w-0">
                                            <p className="font-semibold text-foreground text-sm sm:text-base truncate">{customer.name || 'ไม่ระบุชื่อ'}</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                {customer.phone || customer.email || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-8 sm:ml-0">
                                        {/* Channel Badge */}
                                        <ChannelBadge channel={customer.channel} />
                                        
                                        {/* Days Badge */}
                                        <Badge variant={customer.daysUntil === 0 ? "default" : "secondary"} className="rounded-full px-2 sm:px-3 text-xs">
                                            {customer.daysUntil === 0 ? '🎉 วันนี้!' : `${customer.daysUntil}d`}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Selection Summary & Message Form */}
                        {selectedCustomers.length > 0 && (
                            <div className="mt-6 p-4 sm:p-6 bg-secondary/30 rounded-2xl border border-border">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Send className="h-5 w-5 text-primary" />
                                    เตรียมส่งข้อความ
                                </h3>
                                
                                {/* Channel Summary Cards */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                        <div className="p-2 bg-green-500 rounded-lg">
                                            <MessageSquare className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xl text-green-700">{selectionSummary.line}</p>
                                            <p className="text-xs text-green-600">ผ่าน LINE</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                        <div className="p-2 bg-blue-500 rounded-lg">
                                            <Mail className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xl text-blue-700">{selectionSummary.email}</p>
                                            <p className="text-xs text-blue-600">ผ่าน Email</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                        <div className="p-2 bg-gray-400 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xl text-gray-600">{selectionSummary.none}</p>
                                            <p className="text-xs text-gray-500">ส่งไม่ได้</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Message Input */}
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium">ข้อความ</Label>
                                        <p className="text-xs text-muted-foreground mb-2">ใช้ {"{{name}}"} สำหรับชื่อลูกค้า</p>
                                        <textarea 
                                            value={sendMessage}
                                            onChange={(e) => setSendMessage(e.target.value)}
                                            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                                            rows={4}
                                        />
                                    </div>
                                    
                                    {/* Link Attachment - NEW */}
                                    <div className="p-4 bg-white rounded-xl border-2 border-dashed border-primary/30">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Link2 className="h-5 w-5 text-primary" />
                                            <Label className="text-sm font-semibold">แนบลิงค์ (ไม่บังคับ)</Label>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs text-muted-foreground">URL</Label>
                                                <Input 
                                                    placeholder="https://example.com/products"
                                                    value={linkUrl}
                                                    onChange={(e) => setLinkUrl(e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground">ข้อความปุ่ม</Label>
                                                <Input 
                                                    placeholder="ดูสินค้า"
                                                    value={linkText}
                                                    onChange={(e) => setLinkText(e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        {linkUrl && (
                                            <div className="mt-3 p-3 bg-primary/5 rounded-lg flex items-center gap-2 text-sm">
                                                <ExternalLink className="h-4 w-4 text-primary" />
                                                <span className="text-muted-foreground">Preview:</span>
                                                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
                                                    {linkText || linkUrl}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Send Button */}
                                <Button 
                                    className="w-full mt-6 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                                    onClick={sendToSelected}
                                    disabled={sending || selectionSummary.canSend === 0}
                                >
                                    {sending ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            กำลังส่ง...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Send className="h-5 w-5" />
                                            ส่งให้ {selectionSummary.canSend} คน
                                            <span className="text-primary-foreground/70 font-normal">
                                                ({selectionSummary.line > 0 ? `${selectionSummary.line} LINE` : ''}
                                                {selectionSummary.line > 0 && selectionSummary.email > 0 ? ', ' : ''}
                                                {selectionSummary.email > 0 ? `${selectionSummary.email} Email` : ''})
                                            </span>
                                        </span>
                                    )}
                                </Button>

                                {selectionSummary.none > 0 && (
                                    <p className="text-center text-sm text-muted-foreground mt-3">
                                        ⚠️ {selectionSummary.none} คนจะไม่ได้รับ (ไม่มี LINE หรือ Email)
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Send Result */}
                        {sendResult && (
                            <div className={`mt-6 p-6 rounded-2xl border-2 ${
                                sendResult.success 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-red-50 border-red-200'
                            }`}>
                                <div className="flex items-center gap-3 mb-4">
                                    {sendResult.success ? (
                                        <div className="p-2 bg-green-500 rounded-full">
                                            <CheckCircle2 className="h-6 w-6 text-white" />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-red-500 rounded-full">
                                            <XCircle className="h-6 w-6 text-white" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className={`font-bold text-lg ${sendResult.success ? 'text-green-700' : 'text-red-700'}`}>
                                            {sendResult.success ? 'ส่งสำเร็จ!' : 'เกิดข้อผิดพลาด'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            ส่งได้ {sendResult.sent} จาก {sendResult.total} คน
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                        <MessageSquare className="h-5 w-5 text-green-600" />
                                        <span className="font-medium">LINE: {sendResult.channels?.line || 0} คน</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                        <span className="font-medium">Email: {sendResult.channels?.email || 0} คน</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Campaigns List - Redesigned */}
            {campaigns.length > 0 ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-xl flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            Campaign ทั้งหมด
                        </h2>
                        <Badge variant="secondary" className="text-sm">
                            {campaigns.length} รายการ
                        </Badge>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                        {campaigns.map((campaign) => {
                            const type = TYPE_CONFIG[campaign.campaign_type] || TYPE_CONFIG.custom;
                            const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                            const openRate = campaign.total_sent > 0 
                                ? Math.round((campaign.total_opened / campaign.total_sent) * 100) 
                                : 0;
                            
                            return (
                                <Card key={campaign.id} className="overflow-hidden shadow-premium hover-lift group">
                                    {/* Status Bar */}
                                    <div className={`h-1.5 ${
                                        campaign.status === 'active' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                        campaign.status === 'paused' ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                                        'bg-gradient-to-r from-gray-300 to-gray-400'
                                    }`} />
                                    
                                    <div className="p-5">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2.5 rounded-xl ${type.color} shrink-0`}>
                                                    {type.icon}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-foreground truncate">
                                                        {campaign.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                                                        {campaign.description || 'ไม่มีคำอธิบาย'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={`${status.color} shrink-0`}>
                                                {status.label}
                                            </Badge>
                                        </div>

                                        {/* Stats Grid - Mobile Friendly */}
                                        <div className="grid grid-cols-4 gap-2 p-3 bg-secondary/30 rounded-xl mb-4">
                                            <div className="text-center">
                                                <p className="font-bold text-lg text-foreground">{campaign.total_sent}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">ส่ง</p>
                                            </div>
                                            <div className="text-center border-l border-border">
                                                <p className="font-bold text-lg text-blue-600">{campaign.total_opened}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">เปิด</p>
                                            </div>
                                            <div className="text-center border-l border-border">
                                                <p className="font-bold text-lg text-green-600">{campaign.total_clicked}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">คลิก</p>
                                            </div>
                                            <div className="text-center border-l border-border">
                                                <p className="font-bold text-lg text-primary">{openRate}%</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">อัตรา</p>
                                            </div>
                                        </div>

                                        {/* Actions - Full Width on Mobile */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant={campaign.status === "active" ? "secondary" : "default"}
                                                size="sm"
                                                onClick={() => toggleStatus(campaign)}
                                                className="flex-1 rounded-lg"
                                            >
                                                {campaign.status === "active" ? (
                                                    <><Pause className="h-4 w-4 mr-1.5" />หยุด</>
                                                ) : (
                                                    <><Play className="h-4 w-4 mr-1.5" />เปิดใช้</>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => runCampaign(campaign.id)}
                                                disabled={running === campaign.id}
                                                className="flex-1 rounded-lg bg-primary"
                                            >
                                                {running === campaign.id ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ส่ง...
                                                    </span>
                                                ) : (
                                                    <><Send className="h-4 w-4 mr-1.5" />ส่งทันที</>
                                                )}
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                asChild 
                                                className="rounded-lg px-3"
                                            >
                                                <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>

                                        {/* Last Run Info */}
                                        {campaign.last_run_at && (
                                            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                รันล่าสุด: {formatDate(campaign.last_run_at)}
                                            </p>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <Card className="p-10 text-center shadow-premium">
                    <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-2xl flex items-center justify-center">
                        <Megaphone className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">ยังไม่มี Campaign</h3>
                    <p className="text-muted-foreground mb-5 max-w-sm mx-auto">
                        สร้าง Campaign เพื่อส่งข้อความโปรโมชั่นหรืออวยพรวันเกิดถึงลูกค้า
                    </p>
                    <Button asChild size="lg" className="rounded-full px-6">
                        <Link href="/admin/campaigns/new">
                            <Plus className="h-4 w-4 mr-2" />
                            สร้าง Campaign แรก
                        </Link>
                    </Button>
                </Card>
            )}
        </div>
    );
}
