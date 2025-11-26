import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RiskBadge, RiskScoreBar, getRiskTier } from "@/components/risk-badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Brain,
  Shield,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Package,
  AlertTriangle,
  FileText,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import type { VendorWithDetails, VendorProduct, RiskAssessment, Vulnerability } from "@shared/schema";

export default function VendorDetail() {
  const [, params] = useRoute("/vendors/:id");
  const vendorId = params?.id;
  const { toast } = useToast();

  const { data: vendor, isLoading, error } = useQuery<VendorWithDetails>({
    queryKey: ["/api/vendors", vendorId],
    enabled: !!vendorId,
  });

  const assessMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/vendors/${vendorId}/assess`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Assessment Complete",
        description: "AI risk assessment has been generated successfully.",
      });
    },
    onError: (err) => {
      if (isUnauthorizedError(err as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Assessment Failed",
        description: "Failed to generate AI assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading) {
    return <VendorDetailSkeleton />;
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">Vendor not found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The vendor you're looking for doesn't exist.
        </p>
        <Link href="/vendors">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Vendors
          </Button>
        </Link>
      </div>
    );
  }

  const initials = vendor.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const latestAssessment = vendor.assessments?.[0];
  const { tier } = getRiskTier(vendor.riskScore || 0);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/vendors">
        <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-to-vendors">
          <ArrowLeft className="h-4 w-4" />
          Back to Vendors
        </Button>
      </Link>

      {/* Vendor Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={vendor.logoUrl || undefined} alt={vendor.name} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-vendor-name">
                    {vendor.name}
                  </h1>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {vendor.industry && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {vendor.industry}
                      </div>
                    )}
                    {vendor.website && (
                      <a 
                        href={vendor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <RiskBadge score={vendor.riskScore || 0} />
                  <Button 
                    onClick={() => assessMutation.mutate()}
                    disabled={assessMutation.isPending}
                    className="gap-2"
                    data-testid="button-run-assessment"
                  >
                    {assessMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        Run AI Assessment
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {vendor.description && (
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                  {vendor.description}
                </p>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 mt-4">
                {vendor.contactEmail && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {vendor.contactEmail}
                  </div>
                )}
                {vendor.contactPhone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {vendor.contactPhone}
                  </div>
                )}
                {vendor.address && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {vendor.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Score Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Overall Risk</p>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-3xl font-bold font-mono">{vendor.riskScore || 0}</p>
            <Badge variant="outline" className="text-xs">{tier}</Badge>
          </div>
          <RiskScoreBar score={vendor.riskScore || 0} className="mt-3" />
        </Card>
        
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Security Score</p>
          <p className="text-3xl font-bold font-mono mt-2">
            {latestAssessment?.securityScore || 0}
          </p>
          <RiskScoreBar score={latestAssessment?.securityScore || 0} className="mt-3" />
        </Card>
        
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
          <p className="text-3xl font-bold font-mono mt-2">
            {latestAssessment?.complianceScore || 0}
          </p>
          <RiskScoreBar score={latestAssessment?.complianceScore || 0} className="mt-3" />
        </Card>
        
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Operational Score</p>
          <p className="text-3xl font-bold font-mono mt-2">
            {latestAssessment?.operationalScore || 0}
          </p>
          <RiskScoreBar score={latestAssessment?.operationalScore || 0} className="mt-3" />
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products" className="gap-2" data-testid="tab-products">
            <Package className="h-4 w-4" />
            Products ({vendor.products?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="assessment" className="gap-2" data-testid="tab-assessment">
            <Shield className="h-4 w-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="vulnerabilities" className="gap-2" data-testid="tab-vulnerabilities">
            <AlertTriangle className="h-4 w-4" />
            Vulnerabilities ({vendor.vulnerabilities?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ProductsList products={vendor.products || []} />
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <AssessmentView assessment={latestAssessment} />
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <VulnerabilitiesList vulnerabilities={vendor.vulnerabilities || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProductsList({ products }: { products: VendorProduct[] }) {
  if (products.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No products registered</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Add products/services you use from this vendor for more accurate risk assessment.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {products.map((product) => (
        <Card key={product.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold truncate">{product.name}</h4>
                {product.isActive ? (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-transparent">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Inactive</Badge>
                )}
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {product.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {product.category && (
                  <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                    {product.category}
                  </span>
                )}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">Data Access:</span>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {product.dataAccessLevel || "None"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">Criticality:</span>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {product.businessCriticality || "Low"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AssessmentView({ assessment }: { assessment?: RiskAssessment }) {
  if (!assessment) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Brain className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No assessment yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Run an AI assessment to generate a comprehensive risk analysis for this vendor.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Findings
            </CardTitle>
            {assessment.createdAt && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(assessment.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {assessment.findings || "No findings recorded."}
          </p>
        </CardContent>
      </Card>

      {assessment.aiAnalysis && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {assessment.aiAnalysis}
            </p>
          </CardContent>
        </Card>
      )}

      {assessment.recommendations && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {assessment.recommendations}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function VulnerabilitiesList({ vulnerabilities }: { vulnerabilities: Vulnerability[] }) {
  if (vulnerabilities.length === 0) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
            <Shield className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="font-semibold mb-1">No known vulnerabilities</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            No security vulnerabilities have been identified for this vendor.
          </p>
        </div>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical": return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "high": return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "medium": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500";
      default: return "bg-green-500/10 text-green-600 dark:text-green-400";
    }
  };

  return (
    <div className="space-y-4">
      {vulnerabilities.map((vuln) => (
        <Card key={vuln.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold">{vuln.title}</h4>
                {vuln.cveId && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {vuln.cveId}
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={`text-xs border-transparent ${getSeverityColor(vuln.severity || "low")}`}
                >
                  {vuln.severity || "Unknown"}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${vuln.status === "resolved" ? "bg-green-500/10 text-green-600" : ""}`}
                >
                  {vuln.status === "resolved" ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {vuln.status || "Open"}
                </Badge>
              </div>
              {vuln.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {vuln.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                {vuln.affectedProduct && (
                  <span>Affects: {vuln.affectedProduct}</span>
                )}
                {vuln.publishedDate && (
                  <span>Published: {format(new Date(vuln.publishedDate), "MMM d, yyyy")}</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function VendorDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Card className="p-6">
        <div className="flex gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    </div>
  );
}
