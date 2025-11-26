import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getRiskTier } from "@/components/risk-badge";
import { cn } from "@/lib/utils";
import type { Vendor } from "@shared/schema";

interface RiskHeatmapProps {
  vendors: Vendor[];
  className?: string;
}

export function RiskHeatmap({ vendors, className }: RiskHeatmapProps) {
  // Sort vendors by risk score (highest first)
  const sortedVendors = [...vendors].sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
  
  // Calculate cell size based on vendor count
  const getCellSize = (count: number) => {
    if (count <= 6) return "w-20 h-20";
    if (count <= 12) return "w-16 h-16";
    if (count <= 20) return "w-14 h-14";
    return "w-12 h-12";
  };

  const cellSize = getCellSize(vendors.length);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Risk Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        {vendors.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No vendors to display
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sortedVendors.map((vendor) => {
              const { tier, color } = getRiskTier(vendor.riskScore || 0);
              const initials = vendor.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <Tooltip key={vendor.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        cellSize,
                        "rounded-lg flex items-center justify-center cursor-pointer transition-all",
                        "hover:scale-105 hover:shadow-md"
                      )}
                      style={{ 
                        backgroundColor: color,
                        opacity: 0.15 + ((vendor.riskScore || 0) / 100) * 0.85,
                      }}
                      data-testid={`heatmap-cell-${vendor.id}`}
                    >
                      <span 
                        className="font-bold text-sm"
                        style={{ color }}
                      >
                        {initials}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Risk Score: <span className="font-mono font-semibold">{vendor.riskScore || 0}</span> ({tier})
                      </p>
                      {vendor.industry && (
                        <p className="text-xs text-muted-foreground">{vendor.industry}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-xs text-muted-foreground">Low (0-39)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-yellow-500" />
            <span className="text-xs text-muted-foreground">Medium (40-59)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-orange-500" />
            <span className="text-xs text-muted-foreground">High (60-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-xs text-muted-foreground">Critical (80+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
