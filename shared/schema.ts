import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const clinicalCodes = pgTable("clinical_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codeType: text("code_type").notNull(), // ICD-10, ICD-9, CPT, HCPCS, SNOMED, LOINC, HCC
  code: text("code").notNull(),
  description: text("description").notNull(),
  synonyms: text("synonyms").array().default([]),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull(),
  resultsCount: integer("results_count").notNull(),
  searchType: text("search_type").notNull(), // code, description, bulk
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertClinicalCodeSchema = createInsertSchema(clinicalCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClinicalCode = z.infer<typeof insertClinicalCodeSchema>;
export type ClinicalCode = typeof clinicalCodes.$inferSelect;

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

export type SearchResult = ClinicalCode & {
  matchScore: number;
  matchType: 'exact' | 'fuzzy' | 'synonym';
};

export const codeTypes = ['ICD-10', 'ICD-9', 'CPT', 'HCPCS', 'SNOMED', 'LOINC', 'HCC'] as const;
export type CodeType = typeof codeTypes[number];
