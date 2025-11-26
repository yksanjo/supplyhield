import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { analyzeVendorRisk } from "./openai";
import { searchCves, getCveById, getRecentCvesForVendor } from "./cve";
import { insertVendorSchema, insertVendorProductSchema, insertVulnerabilitySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Vendors - List all
  app.get("/api/vendors", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendors = await storage.getVendors(userId);
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  // Vendors - Top risk
  app.get("/api/vendors/top-risk", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 5;
      const vendors = await storage.getTopRiskVendors(userId, limit);
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching top risk vendors:", error);
      res.status(500).json({ message: "Failed to fetch top risk vendors" });
    }
  });

  // Vendors - Get by ID
  app.get("/api/vendors/:id", isAuthenticated, async (req: any, res) => {
    try {
      const vendor = await storage.getVendorById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  // Vendors - Create
  app.post("/api/vendors", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertVendorSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid vendor data", 
          errors: parsed.error.errors 
        });
      }

      const vendor = await storage.createVendor({
        ...parsed.data,
        createdById: userId,
        riskScore: 0,
        riskTier: "low",
      });

      res.status(201).json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  // Vendors - Update
  app.patch("/api/vendors/:id", isAuthenticated, async (req: any, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, req.body);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });

  // Vendors - Delete
  app.delete("/api/vendors/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteVendor(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });

  // Vendors - Run AI Assessment
  app.post("/api/vendors/:id/assess", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendor = await storage.getVendorById(req.params.id);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      // Run AI analysis
      const analysis = await analyzeVendorRisk({
        name: vendor.name,
        industry: vendor.industry || undefined,
        description: vendor.description || undefined,
        products: vendor.products?.map(p => ({
          name: p.name,
          description: p.description || undefined,
          dataAccessLevel: p.dataAccessLevel || undefined,
          businessCriticality: p.businessCriticality || undefined,
        })),
      });

      // Create assessment record
      const assessment = await storage.createRiskAssessment({
        vendorId: vendor.id,
        assessmentType: "ai_analysis",
        overallScore: analysis.overallScore,
        securityScore: analysis.securityScore,
        complianceScore: analysis.complianceScore,
        financialScore: analysis.financialScore,
        operationalScore: analysis.operationalScore,
        findings: analysis.findings,
        recommendations: analysis.recommendations,
        aiAnalysis: analysis.aiAnalysis,
        assessedById: userId,
      });

      // Update vendor risk score
      const riskTier = 
        analysis.overallScore >= 80 ? "critical" :
        analysis.overallScore >= 60 ? "high" :
        analysis.overallScore >= 40 ? "medium" : "low";

      await storage.updateVendor(vendor.id, {
        riskScore: analysis.overallScore,
        riskTier,
        lastAssessmentDate: new Date(),
      });

      res.json(assessment);
    } catch (error) {
      console.error("Error running AI assessment:", error);
      res.status(500).json({ message: "Failed to run AI assessment" });
    }
  });

  // Vendor Products - Create
  app.post("/api/vendors/:vendorId/products", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertVendorProductSchema.safeParse({
        ...req.body,
        vendorId: req.params.vendorId,
      });
      
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: parsed.error.errors 
        });
      }

      const product = await storage.createVendorProduct(parsed.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // ============== CVE/Vulnerability Routes ==============

  // Search CVEs by keyword
  app.get("/api/cve/search", isAuthenticated, async (req: any, res) => {
    try {
      const keyword = req.query.q as string;
      if (!keyword || keyword.length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }
      
      const limit = parseInt(req.query.limit as string) || 20;
      const cves = await searchCves(keyword, Math.min(limit, 50));
      res.json(cves);
    } catch (error) {
      console.error("Error searching CVEs:", error);
      res.status(500).json({ message: "Failed to search CVEs" });
    }
  });

  // Get CVE by ID
  app.get("/api/cve/:cveId", isAuthenticated, async (req: any, res) => {
    try {
      const cve = await getCveById(req.params.cveId);
      if (!cve) {
        return res.status(404).json({ message: "CVE not found" });
      }
      res.json(cve);
    } catch (error) {
      console.error("Error fetching CVE:", error);
      res.status(500).json({ message: "Failed to fetch CVE" });
    }
  });

  // Get relevant CVEs for a vendor
  app.get("/api/vendors/:id/cves", isAuthenticated, async (req: any, res) => {
    try {
      const vendor = await storage.getVendorById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      const productNames = vendor.products?.map(p => p.name) || [];
      const cves = await getRecentCvesForVendor(vendor.name, productNames);
      res.json(cves);
    } catch (error) {
      console.error("Error fetching CVEs for vendor:", error);
      res.status(500).json({ message: "Failed to fetch CVEs for vendor" });
    }
  });

  // Add vulnerability to vendor (link a CVE or manual entry)
  app.post("/api/vendors/:vendorId/vulnerabilities", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertVulnerabilitySchema.safeParse({
        ...req.body,
        vendorId: req.params.vendorId,
      });
      
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid vulnerability data", 
          errors: parsed.error.errors 
        });
      }

      const vulnerability = await storage.createVulnerability(parsed.data);
      res.status(201).json(vulnerability);
    } catch (error) {
      console.error("Error creating vulnerability:", error);
      res.status(500).json({ message: "Failed to create vulnerability" });
    }
  });

  // Update vulnerability status (e.g., open -> remediated)
  app.patch("/api/vulnerabilities/:id", isAuthenticated, async (req: any, res) => {
    try {
      const vulnerability = await storage.updateVulnerability(req.params.id, req.body);
      if (!vulnerability) {
        return res.status(404).json({ message: "Vulnerability not found" });
      }
      res.json(vulnerability);
    } catch (error) {
      console.error("Error updating vulnerability:", error);
      res.status(500).json({ message: "Failed to update vulnerability" });
    }
  });

  // Delete vulnerability
  app.delete("/api/vulnerabilities/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteVulnerability(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vulnerability:", error);
      res.status(500).json({ message: "Failed to delete vulnerability" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
