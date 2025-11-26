import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { VendorCard, VendorCardSkeleton } from "@/components/vendor-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  Building2,
  ArrowUpDown
} from "lucide-react";
import { Link } from "wouter";
import type { Vendor } from "@shared/schema";

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("risk-desc");

  const { data: vendors, isLoading } = useQuery<(Vendor & { productsCount: number })[]>({
    queryKey: ["/api/vendors"],
  });

  // Get unique industries for filter
  const industries = vendors 
    ? [...new Set(vendors.map(v => v.industry).filter(Boolean))]
    : [];

  // Filter and sort vendors
  const filteredVendors = vendors
    ?.filter((vendor) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          vendor.name.toLowerCase().includes(query) ||
          vendor.industry?.toLowerCase().includes(query) ||
          vendor.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Risk filter
      if (riskFilter !== "all") {
        const score = vendor.riskScore || 0;
        if (riskFilter === "critical" && score < 80) return false;
        if (riskFilter === "high" && (score < 60 || score >= 80)) return false;
        if (riskFilter === "medium" && (score < 40 || score >= 60)) return false;
        if (riskFilter === "low" && score >= 40) return false;
      }
      
      // Industry filter
      if (industryFilter !== "all" && vendor.industry !== industryFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "risk-desc":
          return (b.riskScore || 0) - (a.riskScore || 0);
        case "risk-asc":
          return (a.riskScore || 0) - (b.riskScore || 0);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "recent":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

  const hasActiveFilters = searchQuery || riskFilter !== "all" || industryFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setRiskFilter("all");
    setIndustryFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground mt-1">
            Manage and assess your vendor portfolio
          </p>
        </div>
        <Link href="/vendors/new">
          <Button className="gap-2" data-testid="button-add-vendor">
            <Plus className="h-4 w-4" />
            Add Vendor
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors by name, industry, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-vendors"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-risk-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[160px]" data-testid="select-industry-filter">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry!}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]" data-testid="select-sort">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk-desc">Risk: High to Low</SelectItem>
                <SelectItem value="risk-asc">Risk: Low to High</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
            
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="gap-1"
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Results Count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredVendors?.length || 0} of {vendors?.length || 0} vendors
        </p>
      )}

      {/* Vendors Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => <VendorCardSkeleton key={i} />)
        ) : filteredVendors && filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))
        ) : (
          <Card className="md:col-span-2 xl:col-span-3 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              {hasActiveFilters ? (
                <>
                  <h3 className="font-semibold mb-1">No vendors match your filters</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    Try adjusting your search or filter criteria.
                  </p>
                  <Button variant="outline" size="sm" onClick={clearFilters} data-testid="button-clear-filters-empty">
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
