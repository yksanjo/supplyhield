// CVE Database Integration using NVD (National Vulnerability Database) API
// NVD API documentation: https://nvd.nist.gov/developers/vulnerabilities

interface NvdCveItem {
  id: string;
  sourceIdentifier: string;
  published: string;
  lastModified: string;
  vulnStatus: string;
  descriptions: Array<{ lang: string; value: string }>;
  metrics?: {
    cvssMetricV31?: Array<{
      cvssData: {
        baseScore: number;
        baseSeverity: string;
      };
    }>;
    cvssMetricV2?: Array<{
      cvssData: {
        baseScore: number;
      };
    }>;
  };
  weaknesses?: Array<{
    description: Array<{ lang: string; value: string }>;
  }>;
  configurations?: Array<{
    nodes: Array<{
      cpeMatch: Array<{
        vulnerable: boolean;
        criteria: string;
        matchCriteriaId: string;
      }>;
    }>;
  }>;
  references?: Array<{
    url: string;
    source: string;
    tags?: string[];
  }>;
}

interface NvdApiResponse {
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  format: string;
  version: string;
  timestamp: string;
  vulnerabilities: Array<{ cve: NvdCveItem }>;
}

export interface CveSearchResult {
  cveId: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "none";
  cvssScore: number;
  publishedDate: string;
  lastModified: string;
  references: string[];
  affectedProducts: string[];
}

function mapSeverity(cvssScore: number): "critical" | "high" | "medium" | "low" | "none" {
  if (cvssScore >= 9.0) return "critical";
  if (cvssScore >= 7.0) return "high";
  if (cvssScore >= 4.0) return "medium";
  if (cvssScore > 0) return "low";
  return "none";
}

function extractAffectedProducts(cve: NvdCveItem): string[] {
  const products: string[] = [];
  
  if (cve.configurations) {
    for (const config of cve.configurations) {
      for (const node of config.nodes) {
        for (const cpe of node.cpeMatch) {
          if (cpe.vulnerable && cpe.criteria) {
            // CPE format: cpe:2.3:a:vendor:product:version:...
            const parts = cpe.criteria.split(":");
            if (parts.length >= 5) {
              const vendor = parts[3];
              const product = parts[4];
              const productName = `${vendor}:${product}`.replace(/_/g, " ");
              if (!products.includes(productName)) {
                products.push(productName);
              }
            }
          }
        }
      }
    }
  }
  
  return products.slice(0, 10); // Limit to 10 products for display
}

function parseCveItem(cve: NvdCveItem): CveSearchResult {
  const description = cve.descriptions.find(d => d.lang === "en")?.value || "No description available";
  
  // Get CVSS score (prefer v3.1, fallback to v2)
  let cvssScore = 0;
  if (cve.metrics?.cvssMetricV31?.[0]) {
    cvssScore = cve.metrics.cvssMetricV31[0].cvssData.baseScore;
  } else if (cve.metrics?.cvssMetricV2?.[0]) {
    cvssScore = cve.metrics.cvssMetricV2[0].cvssData.baseScore;
  }
  
  // Create a title from the first sentence of description or truncate
  const title = description.length > 200 
    ? description.substring(0, 200).split(".")[0] + "..."
    : description.split(".")[0];
  
  return {
    cveId: cve.id,
    title,
    description,
    severity: mapSeverity(cvssScore),
    cvssScore,
    publishedDate: cve.published,
    lastModified: cve.lastModified,
    references: cve.references?.slice(0, 5).map(r => r.url) || [],
    affectedProducts: extractAffectedProducts(cve),
  };
}

// Search CVEs by keyword (vendor name, product name, etc.)
export async function searchCves(keyword: string, limit = 20): Promise<CveSearchResult[]> {
  try {
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodedKeyword}&resultsPerPage=${limit}`;
    
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      console.error(`NVD API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data: NvdApiResponse = await response.json();
    return data.vulnerabilities.map(v => parseCveItem(v.cve));
  } catch (error) {
    console.error("Error searching CVEs:", error);
    return [];
  }
}

// Get a specific CVE by ID
export async function getCveById(cveId: string): Promise<CveSearchResult | null> {
  try {
    const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`;
    
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
    });
    
    if (!response.ok) {
      console.error(`NVD API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data: NvdApiResponse = await response.json();
    if (data.vulnerabilities.length === 0) {
      return null;
    }
    
    return parseCveItem(data.vulnerabilities[0].cve);
  } catch (error) {
    console.error("Error fetching CVE:", error);
    return null;
  }
}

// Search CVEs by CPE (Common Platform Enumeration) - more precise product matching
export async function searchCvesByProduct(vendorName: string, productName?: string, limit = 20): Promise<CveSearchResult[]> {
  try {
    // NVD API supports keyword search which works well for vendor/product combinations
    const keyword = productName ? `${vendorName} ${productName}` : vendorName;
    return searchCves(keyword, limit);
  } catch (error) {
    console.error("Error searching CVEs by product:", error);
    return [];
  }
}

// Get recent CVEs (last 7 days) that might affect a vendor based on keywords
export async function getRecentCvesForVendor(vendorName: string, productNames: string[]): Promise<CveSearchResult[]> {
  try {
    const allCves: CveSearchResult[] = [];
    const seenIds = new Set<string>();
    
    // Search by vendor name
    const vendorCves = await searchCves(vendorName, 10);
    for (const cve of vendorCves) {
      if (!seenIds.has(cve.cveId)) {
        seenIds.add(cve.cveId);
        allCves.push(cve);
      }
    }
    
    // Search by each product name (limit to first 3 products to avoid rate limiting)
    for (const product of productNames.slice(0, 3)) {
      const productCves = await searchCves(product, 5);
      for (const cve of productCves) {
        if (!seenIds.has(cve.cveId)) {
          seenIds.add(cve.cveId);
          allCves.push(cve);
        }
      }
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Sort by CVSS score (highest first)
    return allCves.sort((a, b) => b.cvssScore - a.cvssScore);
  } catch (error) {
    console.error("Error fetching recent CVEs for vendor:", error);
    return [];
  }
}
