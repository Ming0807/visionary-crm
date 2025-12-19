"use client";

import { useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Package, ShoppingCart, Users, MessageSquare, Settings, 
  Megaphone, Warehouse, RefreshCw, Calendar, ChevronRight,
  TicketPercent, FileText
} from "lucide-react";
import { ChartSkeleton, StatsGridSkeleton } from "@/components/ui/skeletons";
import { Button } from "@/components/ui/button";

// Lazy load heavy analytics component
const AnalyticsCharts = dynamic(
  () => import("@/components/AnalyticsCharts"),
  {
    loading: () => (
      <div className="space-y-6">
        <StatsGridSkeleton count={4} />
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Quick action item type
interface QuickActionItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

const quickActions: QuickActionItem[] = [
  {
    href: "/admin/products",
    icon: Package,
    title: "สินค้า",
    description: "จัดการสินค้าและ inventory",
    gradient: "from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    href: "/admin/orders",
    icon: ShoppingCart,
    title: "ออเดอร์",
    description: "ดูและจัดการคำสั่งซื้อ",
    gradient: "from-emerald-500/10 to-emerald-600/5 hover:from-emerald-500/20 hover:to-emerald-600/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    href: "/admin/customers",
    icon: Users,
    title: "ลูกค้า",
    description: "ข้อมูลลูกค้าและ RFM",
    gradient: "from-violet-500/10 to-violet-600/5 hover:from-violet-500/20 hover:to-violet-600/10",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    href: "/admin/inbox",
    icon: MessageSquare,
    title: "ข้อความ",
    description: "แชท LINE และการแจ้งเตือน",
    gradient: "from-pink-500/10 to-pink-600/5 hover:from-pink-500/20 hover:to-pink-600/10",
    iconColor: "text-pink-600 dark:text-pink-400",
  },
  {
    href: "/admin/campaigns",
    icon: Megaphone,
    title: "แคมเปญ",
    description: "โปรโมชั่นและการตลาด",
    gradient: "from-orange-500/10 to-orange-600/5 hover:from-orange-500/20 hover:to-orange-600/10",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    href: "/admin/coupons",
    icon: TicketPercent,
    title: "คูปอง",
    description: "จัดการคูปองส่วนลด",
    gradient: "from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    href: "/admin/claims",
    icon: FileText,
    title: "เคลม",
    description: "จัดการการเคลมสินค้า",
    gradient: "from-red-500/10 to-red-600/5 hover:from-red-500/20 hover:to-red-600/10",
    iconColor: "text-red-600 dark:text-red-400",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    title: "ตั้งค่า",
    description: "ตั้งค่าร้านค้าและระบบ",
    gradient: "from-slate-500/10 to-slate-600/5 hover:from-slate-500/20 hover:to-slate-600/10",
    iconColor: "text-slate-600 dark:text-slate-400",
  },
];

// Quick action card component
const QuickActionCard = ({ action }: { action: QuickActionItem }) => {
  const Icon = action.icon;
  return (
    <Link
      href={action.href}
      className={`group relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br ${action.gradient} border border-transparent hover:border-border/50 transition-all duration-200`}
    >
      <div className={`p-2.5 rounded-xl bg-white/80 dark:bg-black/20 shadow-sm ${action.iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {action.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {action.description}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
};

export default function AdminDashboard() {
  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "สวัสดีตอนเช้า ☀️";
    if (hour < 17) return "สวัสดีตอนบ่าย 🌤️";
    if (hour < 20) return "สวัสดีตอนเย็น 🌅";
    return "สวัสดีตอนค่ำ 🌙";
  }, []);

  // Format current date
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {greeting}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm sm:text-base mt-1">
            <Calendar className="h-4 w-4" />
            <span>{currentDate}</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">รีเฟรช</span>
        </Button>
      </div>

      {/* Analytics Charts - Lazy Loaded */}
      <AnalyticsCharts />

      {/* Quick Actions */}
      <div className="bg-card rounded-2xl p-4 sm:p-6 border border-border mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">เมนูลัด</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <QuickActionCard key={action.href} action={action} />
          ))}
        </div>
      </div>
    </div>
  );
}
