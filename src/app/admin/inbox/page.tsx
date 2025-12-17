"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  MessageSquare, 
  Send, 
  User, 
  RefreshCw,
  Circle,
  Sparkles,
  Loader2,
  Search,
  Filter,
  Check,
  CheckCheck,
  Phone,
  Mail,
  Clock,
  ChevronLeft,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeNotifications } from "@/hooks/use-realtime";

// Types
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
  status?: "sending" | "sent" | "delivered" | "failed";
}

type FilterType = "all" | "unread" | "line";

// Skeleton Components
function ConversationSkeleton() {
  return (
    <div className="p-4 border-b border-border animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

function MessageSkeleton({ direction }: { direction: "inbound" | "outbound" }) {
  return (
    <div className={cn("flex", direction === "outbound" ? "justify-end" : "justify-start")}>
      <div className={cn(
        "rounded-2xl px-4 py-3 animate-pulse",
        direction === "outbound" ? "bg-primary/20 rounded-br-md" : "bg-muted rounded-bl-md"
      )}>
        <div className="h-4 bg-muted-foreground/20 rounded w-32" />
        <div className="h-3 bg-muted-foreground/10 rounded w-20 mt-2" />
      </div>
    </div>
  );
}

// Quick Reply Categories
const quickReplyCategories = [
  {
    label: "ทักทาย",
    replies: ["สวัสดีครับ/ค่ะ 🙏", "ยินดีต้อนรับครับ ✨"]
  },
  {
    label: "รอสักครู่",
    replies: ["รอสักครู่นะครับ", "กำลังตรวจสอบให้ครับ"]
  },
  {
    label: "สินค้า",
    replies: ["สินค้ามีพร้อมส่งครับ", "สินค้าหมดชั่วคราวครับ", "กำลังจัดส่งครับ 📦"]
  },
  {
    label: "ขอบคุณ",
    replies: ["ขอบคุณที่สนใจครับ 🙏", "ขอบคุณที่อุดหนุนครับ ❤️"]
  }
];

export default function AdminInboxPage() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Core state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  
  // Loading states
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      // Search filter
      const matchesSearch = debouncedSearch === "" || 
        conv.customer?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        conv.customer?.phone?.includes(debouncedSearch) ||
        conv.lastMessage.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      // Tab filter
      const matchesFilter = 
        activeFilter === "all" ? true :
        activeFilter === "unread" ? conv.unreadCount > 0 :
        activeFilter === "line" ? conv.platform === "line" : true;
      
      return matchesSearch && matchesFilter;
    });
  }, [conversations, debouncedSearch, activeFilter]);

  // Stats
  const unreadCount = useMemo(() => 
    conversations.reduce((acc, c) => acc + c.unreadCount, 0)
  , [conversations]);

  // AI Suggest
  const handleAiSuggest = async () => {
    if (!selectedCustomerId || messages.length === 0) return;

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
    } catch {
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
  const fetchConversations = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const res = await fetch("/api/chat/messages");
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoadingConversations(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async (customerId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/messages?customerId=${customerId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data.map(m => ({ ...m, status: "delivered" as const })));
        setConversations(prev => 
          prev.map(c => c.customerId === customerId ? { ...c, unreadCount: 0 } : c)
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Track incoming message to add to current chat
  const [incomingMessage, setIncomingMessage] = useState<{
    id: string;
    customer_id: string;
    platform: string;
    direction: string;
    content: string;
    is_read: boolean;
    created_at: string;
  } | null>(null);
  
  // Realtime subscription - store incoming message
  useRealtimeNotifications({
    onNewMessage: useCallback((message: { id: string; customer_id: string; platform: string; direction: string; content: string; is_read: boolean; created_at: string }) => {
      console.log("Realtime: New message received:", message.id);
      
      // Refresh conversations list
      fetchConversations();
      
      // Store the incoming message to trigger update
      setIncomingMessage(message);
    }, [fetchConversations]),
    enableSound: true,
  });
  
  // Effect to add incoming message to current chat
  useEffect(() => {
    if (!incomingMessage) return;
    
    console.log("Processing incoming message:", incomingMessage.id, "Current chat:", selectedCustomerId);
    
    // If this message is for the currently selected customer
    if (selectedCustomerId && incomingMessage.customer_id === selectedCustomerId) {
      console.log("Adding message to current chat");
      
      // Add the message directly to state
      setMessages(prev => {
        // Check if already exists
        if (prev.some(m => m.id === incomingMessage.id)) {
          console.log("Message already in list");
          return prev;
        }
        
        return [...prev, {
          id: incomingMessage.id,
          customer_id: incomingMessage.customer_id,
          platform: incomingMessage.platform,
          direction: incomingMessage.direction,
          message_type: "text",
          content: incomingMessage.content,
          is_read: incomingMessage.is_read,
          created_at: incomingMessage.created_at,
          status: "delivered" as const,
        }];
      });
    }
    
    // Clear the incoming message
    setIncomingMessage(null);
  }, [incomingMessage, selectedCustomerId]);

  // Send message with optimistic update
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedCustomerId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      customer_id: selectedCustomerId,
      platform: "line",
      direction: "outbound",
      message_type: "text",
      content: replyText,
      is_read: true,
      created_at: new Date().toISOString(),
      status: "sending",
    };

    // Optimistic update
    setMessages(prev => [...prev, optimisticMessage]);
    setReplyText("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          message: optimisticMessage.content,
          platform: "line",
        }),
      });

      if (res.ok) {
        // Update to sent status
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, status: "sent" as const } : m
        ));
        
        // Simulate delivered after 1s
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.id === tempId ? { ...m, status: "delivered" as const } : m
          ));
        }, 1000);
      } else {
        throw new Error("Failed to send");
      }
    } catch {
      // Mark as failed
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, status: "failed" as const } : m
      ));
      toast({
        title: "ส่งข้อความไม่สำเร็จ",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => fetchConversations(), 30000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Fetch messages on selection
  useEffect(() => {
    if (selectedCustomerId) {
      fetchMessages(selectedCustomerId);
      setShowMobileChat(true);
    }
  }, [selectedCustomerId, fetchMessages]);

  // Format time
  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return "เมื่อกี้";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} นาที`;
    if (diff < 86400000) return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("th-TH", { month: "short", day: "numeric" });
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";
    
    messages.forEach(msg => {
      const msgDate = new Date(msg.created_at).toLocaleDateString("th-TH", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
      
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    
    return groups;
  }, [messages]);

  const selectedConversation = conversations.find(c => c.customerId === selectedCustomerId);

  // Message status icon
  const MessageStatus = ({ status }: { status?: string }) => {
    if (status === "sending") return <Loader2 className="h-3 w-3 animate-spin opacity-70" />;
    if (status === "sent") return <Check className="h-3 w-3 opacity-70" />;
    if (status === "delivered") return <CheckCheck className="h-3 w-3 text-blue-400" />;
    if (status === "failed") return <span className="text-red-400 text-xs">!</span>;
    return null;
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gradient-to-br from-background via-background to-muted/20">
      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-96 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col",
        showMobileChat ? "hidden md:flex" : "flex"
      )}>
        {/* Header with gradient */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xl text-foreground">Inbox</h2>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs animate-pulse">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => fetchConversations(true)}
              disabled={isRefreshing}
              className="hover:bg-primary/10"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาลูกค้า..."
              className="pl-9 bg-background/50 border-muted focus:bg-background"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-2 border-b border-border bg-muted/30">
          {[
            { key: "all" as FilterType, label: "ทั้งหมด" },
            { key: "unread" as FilterType, label: "ยังไม่อ่าน" },
            { key: "line" as FilterType, label: "LINE" },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={activeFilter === tab.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "flex-1 text-xs",
                activeFilter === tab.key && "bg-primary text-primary-foreground"
              )}
            >
              {tab.label}
              {tab.key === "unread" && unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">
                  {unreadCount}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingConversations ? (
            <>
              <ConversationSkeleton />
              <ConversationSkeleton />
              <ConversationSkeleton />
            </>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv.customerId}
                onClick={() => setSelectedCustomerId(conv.customerId)}
                className={cn(
                  "p-4 border-b border-border/50 cursor-pointer transition-all duration-200",
                  "hover:bg-primary/5 hover:border-l-4 hover:border-l-primary",
                  selectedCustomerId === conv.customerId && "bg-primary/10 border-l-4 border-l-primary"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-background shadow-sm">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-medium animate-bounce">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        conv.unreadCount > 0 && "font-bold"
                      )}>
                        {conv.customer?.name || "ลูกค้า"}
                      </p>
                      <span className={cn(
                        "text-xs flex items-center gap-1",
                        conv.unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"
                      )}>
                        <Clock className="h-3 w-3" />
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm truncate",
                      conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {conv.lastMessage}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 border-green-200">
                        LINE
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="font-medium">{debouncedSearch ? "ไม่พบผลลัพธ์" : "ยังไม่มีข้อความ"}</p>
              <p className="text-sm mt-1">
                {debouncedSearch ? "ลองค้นหาด้วยคำอื่น" : "เมื่อลูกค้าส่งข้อความจะแสดงที่นี่"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-gradient-to-b from-background to-muted/10",
        showMobileChat ? "flex" : "hidden md:flex"
      )}>
        {selectedCustomerId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden"
                    onClick={() => {
                      setShowMobileChat(false);
                      setSelectedCustomerId(null);
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/20">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {selectedConversation?.customer?.name || "ลูกค้า"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                      Online via LINE
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConversation?.customer?.phone && (
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {isLoadingMessages ? (
                <div className="space-y-4">
                  <MessageSkeleton direction="inbound" />
                  <MessageSkeleton direction="outbound" />
                  <MessageSkeleton direction="inbound" />
                </div>
              ) : (
                groupedMessages.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center mb-4">
                      <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                        {group.date}
                      </span>
                    </div>
                    
                    {/* Messages */}
                    <div className="space-y-3">
                      {group.messages.map((msg, msgIndex) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex animate-in slide-in-from-bottom-2 duration-300",
                            msg.direction === "outbound" ? "justify-end" : "justify-start"
                          )}
                          style={{ animationDelay: `${msgIndex * 50}ms` }}
                        >
                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                              msg.direction === "outbound"
                                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md"
                                : "bg-card text-foreground rounded-bl-md border border-border/50",
                              msg.status === "failed" && "opacity-50"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            <div className={cn(
                              "flex items-center gap-1 mt-1.5",
                              msg.direction === "outbound" ? "justify-end" : "justify-start"
                            )}>
                              <span className="text-[10px] opacity-70">
                                {formatTime(msg.created_at)}
                              </span>
                              {msg.direction === "outbound" && (
                                <MessageStatus status={msg.status} />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {showQuickReplies && (
              <div className="px-4 py-3 border-t border-border bg-muted/30 animate-in slide-in-from-bottom-2">
                <div className="space-y-3">
                  {quickReplyCategories.map((category) => (
                    <div key={category.label}>
                      <p className="text-xs text-muted-foreground mb-1.5">{category.label}</p>
                      <div className="flex gap-2 flex-wrap">
                        {category.replies.map((text) => (
                          <Button
                            key={text}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => {
                              setReplyText(text);
                              setShowQuickReplies(false);
                            }}
                          >
                            {text}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Input */}
            <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendReply();
                }}
                className="flex gap-2 items-end"
              >
                <Button
                  type="button"
                  variant={showQuickReplies ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className="shrink-0"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleAiSuggest}
                  disabled={isAiLoading || isSending}
                  title="AI Suggest"
                  className="shrink-0 hover:bg-yellow-500/10 hover:text-yellow-500"
                >
                  {isAiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  )}
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    className="pr-12 bg-background/50 border-muted focus:border-primary"
                    disabled={isSending}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!replyText.trim() || isSending}
                  className="shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <MessageSquare className="h-12 w-12 text-primary/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">เลือกแชทเพื่อเริ่มต้น</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                เลือกการสนทนาจากรายการทางซ้ายเพื่อดูข้อความและตอบกลับลูกค้า
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
