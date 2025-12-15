import { cn } from "@/lib/utils";
import { Crown, Star, Award } from "lucide-react";

const tierConfig: Record<string, { label: string; color: string; bg: string; iconType?: string }> = {
  member: { label: "Member", color: "text-gray-600", bg: "bg-gray-100" },
  vip: { label: "VIP", color: "text-yellow-700", bg: "bg-gradient-to-r from-yellow-100 to-amber-100", iconType: "star" },
  platinum: { label: "Platinum", color: "text-white", bg: "bg-gradient-to-r from-gray-800 to-black", iconType: "crown" },
  bronze: { label: "Bronze", color: "text-orange-700", bg: "bg-orange-100" },
  silver: { label: "Silver", color: "text-slate-600", bg: "bg-slate-100" },
  gold: { label: "Gold", color: "text-yellow-700", bg: "bg-yellow-100", iconType: "award" },
  general: { label: "General", color: "text-gray-500", bg: "bg-gray-50" },
};

interface TierBadgeProps {
  tier: string | null;
  size?: "sm" | "md" | "lg";
}

function TierIcon({ type }: { type?: string }) {
  if (type === "star") return <Star className="h-3 w-3" />;
  if (type === "crown") return <Crown className="h-3 w-3" />;
  if (type === "award") return <Award className="h-3 w-3" />;
  return null;
}

export default function TierBadge({ tier, size = "sm" }: TierBadgeProps) {
  const config = tierConfig[tier?.toLowerCase() || "member"] || tierConfig.member;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full",
        config.color,
        config.bg,
        sizeClasses[size]
      )}
    >
      <TierIcon type={config.iconType} />
      {config.label}
    </span>
  );
}
