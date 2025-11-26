import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendors table - companies/suppliers to assess
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  website: varchar("website", { length: 500 }),
  industry: varchar("industry", { length: 100 }),
  description: text("description"),
  logoUrl: varchar("logo_url", { length: 500 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  address: text("address"),
  riskScore: integer("risk_score").default(0),
  riskTier: varchar("risk_tier", { length: 20 }).default("low"),
  lastAssessmentDate: timestamp("last_assessment_date"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products/services used from each vendor
export const vendorProducts = pgTable("vendor_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  dataAccessLevel: varchar("data_access_level", { length: 50 }).default("none"),
  businessCriticality: varchar("business_criticality", { length: 50 }).default("low"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk assessments - AI-powered analysis results
export const riskAssessments = pgTable("risk_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  assessmentType: varchar("assessment_type", { length: 50 }).default("ai_analysis"),
  overallScore: integer("overall_score").default(0),
  securityScore: integer("security_score").default(0),
  complianceScore: integer("compliance_score").default(0),
  financialScore: integer("financial_score").default(0),
  operationalScore: integer("operational_score").default(0),
  findings: text("findings"),
  recommendations: text("recommendations"),
  aiAnalysis: text("ai_analysis"),
  assessedById: varchar("assessed_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Known vulnerabilities affecting vendors (from CVE data)
export const vulnerabilities = pgTable("vulnerabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").references(() => vendors.id).notNull(),
  cveId: varchar("cve_id", { length: 50 }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  severity: varchar("severity", { length: 20 }).default("medium"),
  affectedProduct: varchar("affected_product", { length: 255 }),
  status: varchar("status", { length: 50 }).default("open"),
  publishedDate: timestamp("published_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [vendors.createdById],
    references: [users.id],
  }),
  products: many(vendorProducts),
  assessments: many(riskAssessments),
  vulnerabilities: many(vulnerabilities),
}));

export const vendorProductsRelations = relations(vendorProducts, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorProducts.vendorId],
    references: [vendors.id],
  }),
}));

export const riskAssessmentsRelations = relations(riskAssessments, ({ one }) => ({
  vendor: one(vendors, {
    fields: [riskAssessments.vendorId],
    references: [vendors.id],
  }),
  assessedBy: one(users, {
    fields: [riskAssessments.assessedById],
    references: [users.id],
  }),
}));

export const vulnerabilitiesRelations = relations(vulnerabilities, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vulnerabilities.vendorId],
    references: [vendors.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorProductSchema = createInsertSchema(vendorProducts).omit({ id: true, createdAt: true });
export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({ id: true, createdAt: true });
export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendorProduct = z.infer<typeof insertVendorProductSchema>;
export type VendorProduct = typeof vendorProducts.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;

// Vendor with related data
export type VendorWithDetails = Vendor & {
  products: VendorProduct[];
  assessments: RiskAssessment[];
  vulnerabilities: Vulnerability[];
};
