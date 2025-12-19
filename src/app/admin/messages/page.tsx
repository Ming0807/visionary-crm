"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Mail,
    Phone,
    User,
    MessageSquare,
    Search,
    RefreshCw,
    ChevronLeft,
    Clock,
    Tag,
    CheckCircle2,
    Circle,
    Archive,
    Reply,
    Trash2,
    Loader2,
    X,
    Link2,
    Send,
    Eye,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ContactMessage } from "@/lib/supabase";

type StatusFilter = "all" | "new" | "read" | "replied" | "archived";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Circle }> = {
    new: { label: "ใหม่", color: "bg-red-500/10 text-red-500 border-red-200", icon: Circle },
    read: { label: "อ่านแล้ว", color: "bg-yellow-500/10 text-yellow-500 border-yellow-200", icon: CheckCircle2 },
    replied: { label: "ตอบแล้ว", color: "bg-green-500/10 text-green-500 border-green-200", icon: Reply },
    archived: { label: "เก็บถาวร", color: "bg-gray-500/10 text-gray-500 border-gray-200", icon: Archive },
};

const subjectLabels: Record<string, string> = {
    product: "สอบถามสินค้า",
    order: "สอบถามคำสั่งซื้อ",
    warranty: "เคลมประกัน / ซ่อม",
    other: "อื่นๆ",
};

function MessageSkeleton() {
    return (
        <div className="p-4 border-b border-border animate-pulse">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                </div>
            </div>
        </div>
    );
}

// Reply Modal Component
interface ReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: ContactMessage;
    onSuccess: () => void;
}

function ReplyModal({ isOpen, onClose, message, onSuccess }: ReplyModalProps) {
    const { toast } = useToast();
    const [subject, setSubject] = useState(`ตอบกลับ: ${subjectLabels[message.subject] || message.subject}`);
    const [replyMessage, setReplyMessage] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const [showLinkFields, setShowLinkFields] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!replyMessage.trim()) {
            toast({
                title: "กรุณากรอกข้อความตอบกลับ",
                variant: "destructive",
            });
            return;
        }

        setIsSending(true);
        try {
            const res = await fetch(`/api/admin/contact-messages/${message.id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject,
                    message: replyMessage,
                    linkUrl: linkUrl || undefined,
                    linkText: linkText || undefined,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "✅ ส่งอีเมลสำเร็จ!",
                    description: `ส่งไปยัง ${message.email}`,
                });
                onSuccess();
                onClose();
            } else {
                throw new Error(data.error || "Failed to send");
            }
        } catch (error: any) {
            toast({
                title: "เกิดข้อผิดพลาด",
                description: error.message || "ไม่สามารถส่งอีเมลได้",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Reply className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">ตอบกลับทางอีเมล</h2>
                            <p className="text-xs text-muted-foreground">ถึง: {message.email}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Original Message Quote */}
                    <div className="bg-muted/50 rounded-xl p-4 mb-4 border-l-4 border-primary/30">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">ข้อความต้นฉบับ:</p>
                        <p className="text-sm text-foreground/80 italic line-clamp-3">"{message.message}"</p>
                    </div>

                    {/* Subject */}
                    <div className="mb-4">
                        <label className="text-sm font-medium mb-1.5 block">หัวข้ออีเมล</label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="หัวข้ออีเมล"
                        />
                    </div>

                    {/* Reply Message */}
                    <div className="mb-4">
                        <label className="text-sm font-medium mb-1.5 block">
                            ข้อความตอบกลับ <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="w-full min-h-[150px] px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="พิมพ์ข้อความตอบกลับลูกค้า...&#10;&#10;ลูกค้าจะเห็นข้อความตามที่พิมพ์ รวมถึงการขึ้นบรรทัดใหม่"
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                            {replyMessage.length} ตัวอักษร
                        </p>
                    </div>

                    {/* Link Attachment */}
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={() => setShowLinkFields(!showLinkFields)}
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                            <Link2 className="h-4 w-4" />
                            {showLinkFields ? "ซ่อนลิงก์" : "แนบลิงก์ (ปุ่มกดในอีเมล)"}
                        </button>
                        
                        {showLinkFields && (
                            <div className="mt-3 p-4 bg-muted/30 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="text-xs font-medium mb-1 block text-muted-foreground">URL ลิงก์</label>
                                    <Input
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://example.com/products"
                                        className="text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-1 block text-muted-foreground">ข้อความบนปุ่ม</label>
                                    <Input
                                        value={linkText}
                                        onChange={(e) => setLinkText(e.target.value)}
                                        placeholder="ดูสินค้า"
                                        className="text-sm"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    💡 ลิงก์จะแสดงเป็นปุ่มสวยๆ ในอีเมล
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Preview Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <Eye className="h-4 w-4" />
                        {showPreview ? "ซ่อนตัวอย่าง" : "ดูตัวอย่างอีเมล"}
                    </button>

                    {/* Email Preview */}
                    {showPreview && (
                        <div className="border border-border rounded-xl overflow-hidden mb-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground border-b border-border">
                                ตัวอย่างอีเมลที่ลูกค้าจะได้รับ
                            </div>
                            <div className="p-4 bg-[#faf9f7]">
                                <div className="text-center mb-4">
                                    <h3 className="text-orange-700 font-bold text-lg">The Visionary</h3>
                                    <p className="text-xs text-orange-600">Premium Eyewear</p>
                                </div>
                                <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-4 rounded-t-xl text-center">
                                    <p className="font-semibold">💬 ตอบกลับข้อความของคุณ</p>
                                </div>
                                <div className="bg-white p-4 rounded-b-xl shadow-sm">
                                    <p className="text-sm mb-3">สวัสดีคุณ {message.name},</p>
                                    <div className="bg-stone-100 border-l-4 border-stone-300 p-3 mb-4 rounded-r-lg">
                                        <p className="text-xs text-stone-500 mb-1">ข้อความของคุณ:</p>
                                        <p className="text-xs text-stone-600 italic">
                                            "{message.message.length > 100 ? message.message.substring(0, 100) + "..." : message.message}"
                                        </p>
                                    </div>
                                    <p className="text-sm whitespace-pre-line">{replyMessage || "(ข้อความตอบกลับจะแสดงที่นี่)"}</p>
                                    {linkUrl && (
                                        <div className="text-center mt-4">
                                            <span className="inline-block bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                                                {linkText || "ดูรายละเอียด"} →
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No Email Warning */}
                    {!message.email && (
                        <div className="bg-yellow-500/10 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-700">ลูกค้าไม่ได้ระบุอีเมล</p>
                                <p className="text-sm text-yellow-600">ไม่สามารถส่งอีเมลตอบกลับได้</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4">
                    <Button variant="outline" onClick={onClose} disabled={isSending}>
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={isSending || !message.email || !replyMessage.trim()}
                        className="bg-gradient-to-r from-primary to-primary/80"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                กำลังส่ง...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                ส่งอีเมล
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function AdminMessagesPage() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [unreadCount, setUnreadCount] = useState(0);
    const [showMobileDetail, setShowMobileDetail] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchMessages = useCallback(async (showRefresh = false) => {
        if (showRefresh) setIsRefreshing(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (debouncedSearch) params.set("search", debouncedSearch);

            const res = await fetch(`/api/admin/contact-messages?${params}`);
            const data = await res.json();

            if (res.ok) {
                setMessages(data.messages);
                setPagination((prev) => ({ ...prev, ...data.pagination }));
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถโหลดข้อความได้",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [pagination.page, pagination.limit, statusFilter, debouncedSearch, toast]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleSelectMessage = async (message: ContactMessage) => {
        setSelectedMessage(message);
        setShowMobileDetail(true);

        // Mark as read if new
        if (message.status === "new") {
            setMessages((prev) =>
                prev.map((m) => (m.id === message.id ? { ...m, status: "read" as const } : m))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    const handleUpdateStatus = async (status: ContactMessage["status"]) => {
        if (!selectedMessage) return;
        setIsUpdating(true);

        try {
            const res = await fetch(`/api/admin/contact-messages/${selectedMessage.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                const updated = await res.json();
                setMessages((prev) =>
                    prev.map((m) => (m.id === updated.id ? updated : m))
                );
                setSelectedMessage(updated);
                toast({
                    title: "อัปเดตสถานะสำเร็จ",
                    description: `เปลี่ยนสถานะเป็น "${statusConfig[status].label}"`,
                });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถอัปเดตสถานะได้",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMessage) return;
        if (!confirm("คุณต้องการลบข้อความนี้หรือไม่?")) return;

        setIsUpdating(true);
        try {
            const res = await fetch(`/api/admin/contact-messages/${selectedMessage.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setMessages((prev) => prev.filter((m) => m.id !== selectedMessage.id));
                setSelectedMessage(null);
                setShowMobileDetail(false);
                toast({
                    title: "ลบข้อความสำเร็จ",
                });
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถลบข้อความได้",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReplySuccess = () => {
        // Refresh the selected message
        if (selectedMessage) {
            setMessages((prev) =>
                prev.map((m) => (m.id === selectedMessage.id ? { ...m, status: "replied" as const } : m))
            );
            setSelectedMessage((prev) => prev ? { ...prev, status: "replied" as const } : null);
        }
        fetchMessages();
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();

        if (diff < 60000) return "เมื่อกี้";
        if (diff < 3600000) return `${Math.floor(diff / 60000)} นาทีที่แล้ว`;
        if (diff < 86400000) return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
        return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
    };

    const formatFullDate = (date: string) => {
        return new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <>
            <div className="h-[calc(100vh-64px)] flex bg-gradient-to-br from-background via-background to-muted/20">
                {/* Message List Sidebar */}
                <div className={cn(
                    "w-full md:w-[400px] lg:w-[450px] border-r border-border bg-card/50 flex flex-col",
                    showMobileDetail ? "hidden md:flex" : "flex"
                )}>
                    {/* Header */}
                    <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary" />
                                <h1 className="font-bold text-xl">ข้อความจากลูกค้า</h1>
                                {unreadCount > 0 && (
                                    <Badge className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs animate-pulse">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => fetchMessages(true)}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                            </Button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..."
                                className="pl-9 bg-background/50"
                            />
                        </div>
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex gap-1 p-2 border-b border-border bg-muted/30 overflow-x-auto">
                        {(["all", "new", "read", "replied", "archived"] as StatusFilter[]).map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "text-xs whitespace-nowrap",
                                    statusFilter === status && "bg-primary text-primary-foreground"
                                )}
                            >
                                {status === "all" ? "ทั้งหมด" : statusConfig[status].label}
                                {status === "new" && unreadCount > 0 && (
                                    <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>

                    {/* Message List */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <>
                                <MessageSkeleton />
                                <MessageSkeleton />
                                <MessageSkeleton />
                            </>
                        ) : messages.length > 0 ? (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    onClick={() => handleSelectMessage(msg)}
                                    className={cn(
                                        "p-4 border-b border-border/50 cursor-pointer transition-all duration-200",
                                        "hover:bg-primary/5 hover:border-l-4 hover:border-l-primary",
                                        selectedMessage?.id === msg.id && "bg-primary/10 border-l-4 border-l-primary",
                                        msg.status === "new" && "bg-red-500/5"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className={cn(
                                                    "font-medium text-sm truncate",
                                                    msg.status === "new" && "font-bold"
                                                )}>
                                                    {msg.name}
                                                </p>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(msg.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-1.5 truncate">
                                                {msg.phone} {msg.email && `• ${msg.email}`}
                                            </p>
                                            <p className="text-sm text-foreground truncate mb-2">
                                                {msg.message}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", statusConfig[msg.status].color)}>
                                                    {statusConfig[msg.status].label}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                    <Tag className="h-2.5 w-2.5 mr-1" />
                                                    {subjectLabels[msg.subject] || msg.subject}
                                                </Badge>
                                                {!msg.email && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-yellow-500/10 text-yellow-600 border-yellow-200">
                                                        ไม่มีอีเมล
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                <p className="font-medium">ไม่พบข้อความ</p>
                                <p className="text-sm mt-1">
                                    {debouncedSearch ? "ลองค้นหาด้วยคำอื่น" : "เมื่อลูกค้าส่งข้อความจะแสดงที่นี่"}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="p-3 border-t border-border flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                หน้า {pagination.page}/{pagination.totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page <= 1}
                                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                                >
                                    ก่อนหน้า
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                                >
                                    ถัดไป
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Message Detail */}
                <div className={cn(
                    "flex-1 flex flex-col bg-gradient-to-b from-background to-muted/10",
                    showMobileDetail ? "flex" : "hidden md:flex"
                )}>
                    {selectedMessage ? (
                        <>
                            {/* Detail Header */}
                            <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="md:hidden"
                                            onClick={() => {
                                                setShowMobileDetail(false);
                                                setSelectedMessage(null);
                                            }}
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </Button>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{selectedMessage.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFullDate(selectedMessage.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedMessage.email && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => setShowReplyModal(true)}
                                                className="bg-gradient-to-r from-primary to-primary/80"
                                            >
                                                <Reply className="h-4 w-4 mr-1" />
                                                ตอบกลับ
                                            </Button>
                                        )}
                                        <Badge variant="outline" className={cn("px-2 py-1", statusConfig[selectedMessage.status].color)}>
                                            {statusConfig[selectedMessage.status].label}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                                <div className="max-w-2xl mx-auto space-y-6">
                                    {/* Contact Info */}
                                    <div className="bg-card rounded-xl p-4 border border-border">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" />
                                            ข้อมูลติดต่อ
                                        </h3>
                                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <a href={`tel:${selectedMessage.phone}`} className="hover:text-primary">
                                                    {selectedMessage.phone}
                                                </a>
                                            </div>
                                            {selectedMessage.email ? (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="h-4 w-4" />
                                                    <a href={`mailto:${selectedMessage.email}`} className="hover:text-primary truncate">
                                                        {selectedMessage.email}
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-yellow-600">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>ไม่ได้ระบุอีเมล</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="bg-card rounded-xl p-4 border border-border">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-primary" />
                                            หัวข้อ
                                        </h3>
                                        <Badge variant="secondary" className="text-sm">
                                            {subjectLabels[selectedMessage.subject] || selectedMessage.subject}
                                        </Badge>
                                    </div>

                                    {/* Message */}
                                    <div className="bg-card rounded-xl p-4 border border-border">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-primary" />
                                            ข้อความ
                                        </h3>
                                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                            {selectedMessage.message}
                                        </p>
                                    </div>

                                    {/* Admin Notes (if replied) */}
                                    {selectedMessage.admin_notes && (
                                        <div className="bg-green-500/10 rounded-xl p-4 border border-green-200">
                                            <h3 className="font-semibold mb-2 text-green-700 flex items-center gap-2">
                                                <Reply className="h-4 w-4" />
                                                ตอบกลับแล้ว
                                            </h3>
                                            <p className="text-sm text-green-800 whitespace-pre-wrap">
                                                {selectedMessage.admin_notes}
                                            </p>
                                            {selectedMessage.replied_at && (
                                                <p className="text-xs text-green-600 mt-2">
                                                    เมื่อ {formatFullDate(selectedMessage.replied_at)}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                    <span className="text-sm text-muted-foreground mr-2 self-center">เปลี่ยนสถานะ:</span>
                                    {(["read", "replied", "archived"] as const).map((status) => (
                                        <Button
                                            key={status}
                                            variant={selectedMessage.status === status ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleUpdateStatus(status)}
                                            disabled={isUpdating || selectedMessage.status === status}
                                            className="text-xs"
                                        >
                                            {isUpdating ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <>
                                                    {status === "read" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                    {status === "replied" && <Reply className="h-3 w-3 mr-1" />}
                                                    {status === "archived" && <Archive className="h-3 w-3 mr-1" />}
                                                    {statusConfig[status].label}
                                                </>
                                            )}
                                        </Button>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete}
                                        disabled={isUpdating}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        ลบ
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                    <Mail className="h-12 w-12 text-primary/50" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">เลือกข้อความ</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    เลือกข้อความจากรายการทางซ้ายเพื่อดูรายละเอียด
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            {selectedMessage && (
                <ReplyModal
                    isOpen={showReplyModal}
                    onClose={() => setShowReplyModal(false)}
                    message={selectedMessage}
                    onSuccess={handleReplySuccess}
                />
            )}
        </>
    );
}
