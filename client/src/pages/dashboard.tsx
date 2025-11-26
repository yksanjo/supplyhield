import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/metric-card";
import { VendorCard, VendorCardSkeleton } from "@/components/vendor-card";
import { RiskHeatmap } from "@/components/risk-heatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  AlertTriangle, 
  Shield, 
  TrendingUp,
  Plus,
  ArrowRight,
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { Link } from "wouter";
import type { Vendor } from "@shared/schema";

interface DashboardStats {
  totalVendors: number;
  criticalRiskVendors: number;
  highRiskVendors: number;
  averageRiskScore: number;
  vendorsAssessedThisMonth: number;
  openVulnerabilities: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: topRiskVendors, isLoading: vendorsLoading } = useQuery<(Vendor & { productsCount: number })[]>({
    queryKey: ["/api/vendors/top-risk"],
  });

  const { data: allVendors } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your supply chain risk landscape
          </p>
        </div>
        <Link href="/vendors/new">
          <Button className="gap-2" data-testid="button-add-vendor">
            <Plus className="h-4 w-4" />
            Add Vendor
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <div data-testid="metric-total-vendors">
              <MetricCard
                title="Total Vendors"
                value={stats?.totalVendors || 0}
                icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
                subtitle="in your portfolio"
              />
            </div>
            <div data-testid="metric-critical-risk">
              <MetricCard
                title="Critical Risk"
                value={stats?.criticalRiskVendors || 0}
                icon={<AlertCircle className="h-5 w-5 text-red-500" />}
                subtitle="vendors need attention"
                valueClassName="text-red-500"
              />
            </div>
            <div data-testid="metric-average-risk">
              <MetricCard
                title="Average Risk Score"
                value={stats?.averageRiskScore || 0}
                icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
                subtitle="across all vendors"
              />
            </div>
            <div data-testid="metric-open-vulnerabilities">
              <MetricCard
                title="Open Vulnerabilities"
                value={stats?.openVulnerabilities || 0}
                icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
                subtitle="require remediation"
              />
            </div>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Risk Vendors */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Top Risk Vendors</CardTitle>
            <Link href="/vendors">
              <Button variant="ghost" size="sm" className="text-xs gap-1" data-testid="button-view-all-vendors">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendorsLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <VendorCardSkeleton key={i} />
                ))}
              </>
            ) : topRiskVendors && topRiskVendors.length > 0 ? (
              topRiskVendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShieldCheck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No vendors yet</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                  Start by adding your first vendor to begin tracking supply chain risk.
                </p>
                <Link href="/vendors/new">
                  <Button size="sm" className="gap-2" data-testid="button-add-first-vendor">
                    <Plus className="h-4 w-4" />
                    Add First Vendor
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Breakdown */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Critical</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">
                    {stats?.criticalRiskVendors || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm">High</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">
                    {stats?.highRiskVendors || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Medium</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">
                    {(stats?.totalVendors || 0) - (stats?.criticalRiskVendors || 0) - (stats?.highRiskVendors || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Low</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">
                    {Math.max(0, (stats?.totalVendors || 0) - (stats?.criticalRiskVendors || 0) - (stats?.highRiskVendors || 0))}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Assessed this month</span>
                <span className="font-mono font-semibold">
                  {statsLoading ? <Skeleton className="h-4 w-6 inline-block" /> : stats?.vendorsAssessedThisMonth || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total vulnerabilities</span>
                <span className="font-mono font-semibold">
                  {statsLoading ? <Skeleton className="h-4 w-6 inline-block" /> : stats?.openVulnerabilities || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Heatmap */}
      {allVendors && allVendors.length > 0 && (
        <RiskHeatmap vendors={allVendors} />
      )}
    </div>
  );
}
