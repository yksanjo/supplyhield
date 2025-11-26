import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  valueClassName,
}: MetricCardProps) {
  const TrendIcon = trend 
    ? trend.value > 0 
      ? TrendingUp 
      : trend.value < 0 
        ? TrendingDown 
        : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? "text-red-500"
      : trend.value < 0
        ? "text-green-500"
        : "text-muted-foreground"
    : "";

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className={cn("text-3xl font-bold font-mono mt-2 tracking-tight", valueClassName)}>
            {value}
          </p>
          {(subtitle || trend) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && TrendIcon && (
                <span className={cn("flex items-center gap-0.5 text-sm font-medium", trendColor)}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {Math.abs(trend.value)}%
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-2.5 rounded-lg bg-muted/50">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
