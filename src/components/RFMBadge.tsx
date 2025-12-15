import { cn } from "@/lib/utils";

const segmentConfig: Record<string, { label: string; color: string; bg: string }> = {
  champion: { label: "Champion", color: "text-emerald-700", bg: "bg-emerald-100" },
  loyal: { label: "Loyal", color: "text-blue-700", bg: "bg-blue-100" },
  potential: { label: "Potential", color: "text-indigo-700", bg: "bg-indigo-100" },
  promising: { label: "Promising", color: "text-purple-700", bg: "bg-purple-100" },
  new: { label: "New", color: "text-cyan-700", bg: "bg-cyan-100" },
  at_risk: { label: "At Risk", color: "text-orange-700", bg: "bg-orange-100" },
  dormant: { label: "Dormant", color: "text-gray-600", bg: "bg-gray-100" },
  lost: { label: "Lost", color: "text-red-700", bg: "bg-red-100" },
  default: { label: "Unknown", color: "text-gray-500", bg: "bg-gray-50" },
};

interface RFMBadgeProps {
  segment: string | null;
  score?: string | null;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RFMBadge({ segment, score, showScore = false, size = "sm" }: RFMBadgeProps) {
  const config = segmentConfig[segment?.toLowerCase() || "default"] || segmentConfig.default;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center font-medium rounded-full",
          config.color,
          config.bg,
          sizeClasses[size]
        )}
      >
        {config.label}
      </span>
      {showScore && score && (
        <span className="text-xs text-muted-foreground font-mono">
          ({score})
        </span>
      )}
    </div>
  );
}
