import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Shield, ShieldCheck } from "lucide-react";

interface RiskBadgeProps {
  score: number;
  showScore?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function getRiskTier(score: number): { tier: string; color: string; bgClass: string; textClass: string; icon: typeof AlertCircle } {
  if (score >= 80) {
    return {
      tier: "Critical",
      color: "hsl(0, 84%, 50%)",
      bgClass: "bg-red-500/10 dark:bg-red-500/20",
      textClass: "text-red-600 dark:text-red-400",
      icon: AlertCircle,
    };
  } else if (score >= 60) {
    return {
      tier: "High",
      color: "hsl(25, 95%, 50%)",
      bgClass: "bg-orange-500/10 dark:bg-orange-500/20",
      textClass: "text-orange-600 dark:text-orange-400",
      icon: AlertTriangle,
    };
  } else if (score >= 40) {
    return {
      tier: "Medium",
      color: "hsl(45, 93%, 47%)",
      bgClass: "bg-yellow-500/10 dark:bg-yellow-500/20",
      textClass: "text-yellow-600 dark:text-yellow-500",
      icon: Shield,
    };
  } else {
    return {
      tier: "Low",
      color: "hsl(142, 76%, 36%)",
      bgClass: "bg-green-500/10 dark:bg-green-500/20",
      textClass: "text-green-600 dark:text-green-400",
      icon: ShieldCheck,
    };
  }
}

export function RiskBadge({ score, showScore = true, size = "default", className }: RiskBadgeProps) {
  const { tier, bgClass, textClass, icon: Icon } = getRiskTier(score);
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        "gap-1.5 border-transparent font-semibold",
        bgClass,
        textClass,
        size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
    >
      <Icon className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span>{tier}</span>
      {showScore && (
        <span className="font-mono opacity-80">({score})</span>
      )}
    </Badge>
  );
}

export function RiskScoreBar({ score, className }: { score: number; className?: string }) {
  const { color } = getRiskTier(score);
  
  return (
    <div className={cn("w-full h-2 bg-muted rounded-full overflow-hidden", className)}>
      <div 
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ 
          width: `${score}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
