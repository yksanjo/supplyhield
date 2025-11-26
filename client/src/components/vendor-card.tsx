import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RiskBadge, RiskScoreBar } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Building2, Package, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vendor } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

interface VendorCardProps {
  vendor: Vendor & { productsCount?: number };
  className?: string;
}

export function VendorCard({ vendor, className }: VendorCardProps) {
  const initials = vendor.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className={cn("p-4 hover-elevate transition-colors", className)}>
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={vendor.logoUrl || undefined} alt={vendor.name} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate" data-testid={`text-vendor-name-${vendor.id}`}>
                {vendor.name}
              </h3>
              {vendor.industry && (
                <div className="flex items-center gap-1.5 mt-0.5 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{vendor.industry}</span>
                </div>
              )}
            </div>
            <RiskBadge score={vendor.riskScore || 0} size="sm" />
          </div>

          <div className="mt-3">
            <RiskScoreBar score={vendor.riskScore || 0} />
          </div>

          <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {vendor.productsCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  <span>{vendor.productsCount} products</span>
                </div>
              )}
              {vendor.lastAssessmentDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Assessed {format(new Date(vendor.lastAssessmentDate), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
            
            <Link href={`/vendors/${vendor.id}`}>
              <Button variant="ghost" size="sm" className="text-xs gap-1" data-testid={`button-view-vendor-${vendor.id}`}>
                View Details
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function VendorCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="h-2 w-full bg-muted rounded-full mt-3 animate-pulse" />
          <div className="flex items-center justify-between mt-3">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  );
}
