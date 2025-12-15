"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  MessageSquare, 
  Send, 
  User, 
  RefreshCw,
  Circle,
  Sparkles,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  customerId: string;
  customer: {
    id: string;
    name: string | null;
    phone: string | null;
  } | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  platform: string;
}

interface Message {
  id: string;
  customer_id: string;
  platform: string;
  direction: string;
  message_type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminInboxPage() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI Suggest function
  const handleAiSuggest = async () => {
    if (!selectedCustomerId || messages.length === 0) return;

    // Get last inbound message
    const lastInboundMsg = [...messages].reverse().find(m => m.direction === "inbound");
    if (!lastInboundMsg) {
      toast({
        title: "ไม่พบข้อความจากลูกค้า",
        description: "ต้องมีข้อความจากลูกค้าก่อนจึงจะใช้ AI ได้",
        variant: "destructive",
      });
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          customerMessage: lastInboundMsg.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReplyText(data.suggestion);
        toast({
          title: "✨ AI Suggestion",
          description: "ข้อความถูกสร้างโดย AI กรุณาตรวจสอบก่อนส่ง",
        });
      } else {
        throw new Error("AI suggest failed");
      }
    } catch (error) {
      console.error("AI error:", error);
      toast({
        title: "AI ไม่สามารถสร้างข้อความได้",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/chat/messages");
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Fetch messages for selected customer
  const fetchMessages = async (customerId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chat/messages?customerId=${customerId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
        // Update unread count in conversations
        setConversations(prev => 
          prev.map(c => c.customerId === customerId ? { ...c, unreadCount: 0 } : c)
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedCustomerId) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/chat/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          message: replyText,
          platform: "line",
        }),
      });

      if (res.ok) {
        // Add message to local state
        const newMessage: Message = {
          id: Date.now().toString(),
          customer_id: selectedCustomerId,
          platform: "line",
          direction: "outbound",
          message_type: "text",
          content: replyText,
          is_read: true,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMessage]);
        setReplyText("");
        
        toast({
          title: "ส่งข้อความสำเร็จ",
          description: "ข้อความถูกส่งไปยังลูกค้าแล้ว",
        });
      } else {
        throw new Error("Failed to send");
      }
    } catch (error) {
      console.error("Send error:", error);
      toast({
        title: "ส่งข้อความไม่สำเร็จ",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
    
    // Polling every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages when customer selected
  useEffect(() => {
    if (selectedCustomerId) {
      fetchMessages(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("th-TH", { month: "short", day: "numeric" });
  };

  const selectedConversation = conversations.find(c => c.customerId === selectedCustomerId);

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Inbox</h2>
            <Button variant="ghost" size="icon" onClick={fetchConversations}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.customerId}
                onClick={() => setSelectedCustomerId(conv.customerId)}
                className={cn(
                  "p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedCustomerId === conv.customerId && "bg-muted"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {conv.customer?.name || "Unknown"}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground rounded-full px-2">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ยังไม่มีข้อความ</p>
              <p className="text-sm mt-1">เมื่อลูกค้าส่งข้อความจะแสดงที่นี่</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedCustomerId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {selectedConversation?.customer?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                    LINE
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">
                  Loading...
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.direction === "outbound" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        msg.direction === "outbound"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={cn(
                        "text-xs mt-1 opacity-70",
                        msg.direction === "outbound" ? "text-right" : "text-left"
                      )}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 pt-3 border-t border-border bg-muted/30">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  "สวัสดีครับ/ค่ะ 🙏",
                  "รอสักครู่นะครับ",
                  "ขอบคุณที่สนใจครับ",
                  "สินค้ามีพร้อมส่งครับ",
                  "รายละเอียดเพิ่มเติมครับ",
                ].map((text) => (
                  <Button
                    key={text}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap text-xs shrink-0"
                    onClick={() => setReplyText(text)}
                  >
                    {text}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-border bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendReply();
                }}
                className="flex gap-2"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAiSuggest}
                  disabled={isAiLoading || isSending}
                  title="AI Suggest"
                  className="shrink-0"
                >
                  {isAiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  )}
                </Button>
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="พิมพ์ข้อความ หรือกด ✨ เพื่อให้ AI ช่วยร่าง..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button type="submit" disabled={!replyText.trim() || isSending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium">เลือกแชทเพื่อดูข้อความ</h3>
              <p className="text-sm mt-1">เลือกจากรายการทางซ้าย</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
