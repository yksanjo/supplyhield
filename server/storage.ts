import {
  users,
  vendors,
  vendorProducts,
  riskAssessments,
  vulnerabilities,
  type User,
  type UpsertUser,
  type Vendor,
  type InsertVendor,
  type VendorProduct,
  type InsertVendorProduct,
  type RiskAssessment,
  type InsertRiskAssessment,
  type Vulnerability,
  type InsertVulnerability,
  type VendorWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Vendor operations
  getVendors(userId: string): Promise<(Vendor & { productsCount: number })[]>;
  getVendorById(id: string): Promise<VendorWithDetails | undefined>;
  getTopRiskVendors(userId: string, limit?: number): Promise<(Vendor & { productsCount: number })[]>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<boolean>;

  // Vendor products
  getVendorProducts(vendorId: string): Promise<VendorProduct[]>;
  createVendorProduct(product: InsertVendorProduct): Promise<VendorProduct>;

  // Risk assessments
  getVendorAssessments(vendorId: string): Promise<RiskAssessment[]>;
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;

  // Vulnerabilities
  getVendorVulnerabilities(vendorId: string): Promise<Vulnerability[]>;
  createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;

  // Dashboard stats
  getDashboardStats(userId: string): Promise<{
    totalVendors: number;
    criticalRiskVendors: number;
    highRiskVendors: number;
    averageRiskScore: number;
    vendorsAssessedThisMonth: number;
    openVulnerabilities: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Vendor operations
  async getVendors(userId: string): Promise<(Vendor & { productsCount: number })[]> {
    const vendorList = await db
      .select()
      .from(vendors)
      .where(eq(vendors.createdById, userId))
      .orderBy(desc(vendors.riskScore));

    // Get product counts for each vendor
    const vendorsWithCounts = await Promise.all(
      vendorList.map(async (vendor) => {
        const products = await db
          .select()
          .from(vendorProducts)
          .where(eq(vendorProducts.vendorId, vendor.id));
        return { ...vendor, productsCount: products.length };
      })
    );

    return vendorsWithCounts;
  }

  async getVendorById(id: string): Promise<VendorWithDetails | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    if (!vendor) return undefined;

    const products = await db
      .select()
      .from(vendorProducts)
      .where(eq(vendorProducts.vendorId, id));

    const assessmentsList = await db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.vendorId, id))
      .orderBy(desc(riskAssessments.createdAt));

    const vulnList = await db
      .select()
      .from(vulnerabilities)
      .where(eq(vulnerabilities.vendorId, id))
      .orderBy(desc(vulnerabilities.createdAt));

    return {
      ...vendor,
      products,
      assessments: assessmentsList,
      vulnerabilities: vulnList,
    };
  }

  async getTopRiskVendors(userId: string, limit = 5): Promise<(Vendor & { productsCount: number })[]> {
    const vendorList = await db
      .select()
      .from(vendors)
      .where(eq(vendors.createdById, userId))
      .orderBy(desc(vendors.riskScore))
      .limit(limit);

    const vendorsWithCounts = await Promise.all(
      vendorList.map(async (vendor) => {
        const products = await db
          .select()
          .from(vendorProducts)
          .where(eq(vendorProducts.vendorId, vendor.id));
        return { ...vendor, productsCount: products.length };
      })
    );

    return vendorsWithCounts;
  }

  async createVendor(vendorData: InsertVendor): Promise<Vendor> {
    const [vendor] = await db.insert(vendors).values(vendorData).returning();
    return vendor;
  }

  async updateVendor(id: string, vendorData: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [vendor] = await db
      .update(vendors)
      .set({ ...vendorData, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return vendor;
  }

  async deleteVendor(id: string): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id));
    return true;
  }

  // Vendor products
  async getVendorProducts(vendorId: string): Promise<VendorProduct[]> {
    return db
      .select()
      .from(vendorProducts)
      .where(eq(vendorProducts.vendorId, vendorId));
  }

  async createVendorProduct(product: InsertVendorProduct): Promise<VendorProduct> {
    const [created] = await db.insert(vendorProducts).values(product).returning();
    return created;
  }

  // Risk assessments
  async getVendorAssessments(vendorId: string): Promise<RiskAssessment[]> {
    return db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.vendorId, vendorId))
      .orderBy(desc(riskAssessments.createdAt));
  }

  async createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const [created] = await db.insert(riskAssessments).values(assessment).returning();
    return created;
  }

  // Vulnerabilities
  async getVendorVulnerabilities(vendorId: string): Promise<Vulnerability[]> {
    return db
      .select()
      .from(vulnerabilities)
      .where(eq(vulnerabilities.vendorId, vendorId))
      .orderBy(desc(vulnerabilities.createdAt));
  }

  async createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability> {
    const [created] = await db.insert(vulnerabilities).values(vulnerability).returning();
    return created;
  }

  // Dashboard stats
  async getDashboardStats(userId: string) {
    const allVendors = await db
      .select()
      .from(vendors)
      .where(eq(vendors.createdById, userId));

    const totalVendors = allVendors.length;
    const criticalRiskVendors = allVendors.filter((v) => (v.riskScore || 0) >= 80).length;
    const highRiskVendors = allVendors.filter((v) => (v.riskScore || 0) >= 60 && (v.riskScore || 0) < 80).length;
    const averageRiskScore = totalVendors > 0
      ? Math.round(allVendors.reduce((sum, v) => sum + (v.riskScore || 0), 0) / totalVendors)
      : 0;

    // Vendors assessed this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const vendorsAssessedThisMonth = allVendors.filter(
      (v) => v.lastAssessmentDate && new Date(v.lastAssessmentDate) >= startOfMonth
    ).length;

    // Count open vulnerabilities
    let openVulnerabilities = 0;
    for (const vendor of allVendors) {
      const vulns = await db
        .select()
        .from(vulnerabilities)
        .where(
          and(
            eq(vulnerabilities.vendorId, vendor.id),
            eq(vulnerabilities.status, "open")
          )
        );
      openVulnerabilities += vulns.length;
    }

    return {
      totalVendors,
      criticalRiskVendors,
      highRiskVendors,
      averageRiskScore,
      vendorsAssessedThisMonth,
      openVulnerabilities,
    };
  }
}

export const storage = new DatabaseStorage();
