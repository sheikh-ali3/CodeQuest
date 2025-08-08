import { type User, type InsertUser, type ClinicalCode, type InsertClinicalCode, type SearchHistory, type InsertSearchHistory, type SearchResult, type CodeType } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, clinicalCodes, searchHistory } from '@shared/schema';
import { eq, like, ilike, or, desc } from 'drizzle-orm';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getClinicalCode(id: string): Promise<ClinicalCode | undefined>;
  getAllClinicalCodes(): Promise<ClinicalCode[]>;
  getClinicalCodesByType(codeType: CodeType): Promise<ClinicalCode[]>;
  createClinicalCode(code: InsertClinicalCode): Promise<ClinicalCode>;
  createClinicalCodes(codes: InsertClinicalCode[]): Promise<ClinicalCode[]>;
  searchClinicalCodes(query: string, codeType?: CodeType): Promise<SearchResult[]>;
  
  createSearchHistory(history: InsertSearchHistory): Promise<SearchHistory>;
  getRecentSearchHistory(limit?: number): Promise<SearchHistory[]>;
  
  getCodeTypeStats(): Promise<Record<CodeType, number>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clinicalCodes: Map<string, ClinicalCode>;
  private searchHistory: Map<string, SearchHistory>;

  constructor() {
    this.users = new Map();
    this.clinicalCodes = new Map();
    this.searchHistory = new Map();
    
    // Initialize with some sample clinical codes
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const sampleCodes: InsertClinicalCode[] = [
      {
        codeType: 'ICD-10',
        code: 'E11.9',
        description: 'Type 2 diabetes mellitus without complications',
        synonyms: ['T2DM', 'Diabetes Mellitus Type II', 'NIDDM'],
        category: 'Endocrine Disorders'
      },
      {
        codeType: 'ICD-10',
        code: 'E11.65',
        description: 'Type 2 diabetes mellitus with hyperglycemia',
        synonyms: ['T2DM with hyperglycemia', 'Diabetic hyperglycemia'],
        category: 'Endocrine Disorders'
      },
      {
        codeType: 'ICD-9',
        code: '250.00',
        description: 'Diabetes mellitus without mention of complication',
        synonyms: ['DM', 'Diabetes'],
        category: 'Endocrine Disorders'
      },
      {
        codeType: 'CPT',
        code: '99213',
        description: 'Office or other outpatient visit for the evaluation and management of an established patient',
        synonyms: ['Established patient visit', 'Office visit level 3'],
        category: 'Evaluation and Management'
      },
      {
        codeType: 'SNOMED',
        code: '44054006',
        description: 'Diabetes mellitus type 2',
        synonyms: ['Type 2 diabetes', 'Non-insulin dependent diabetes'],
        category: 'Clinical Finding'
      },
      {
        codeType: 'HCC',
        code: '19',
        description: 'Diabetes without Complication',
        synonyms: ['DM without complications'],
        category: 'Risk Factor'
      },
      {
        codeType: 'ICD-10',
        code: 'I10',
        description: 'Essential hypertension',
        synonyms: ['High blood pressure', 'HTN', 'Primary hypertension'],
        category: 'Circulatory System'
      },
      {
        codeType: 'ICD-10',
        code: 'J44.1',
        description: 'Chronic obstructive pulmonary disease with acute exacerbation',
        synonyms: ['COPD exacerbation', 'Acute COPD'],
        category: 'Respiratory System'
      }
    ];

    for (const code of sampleCodes) {
      await this.createClinicalCode(code);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getClinicalCode(id: string): Promise<ClinicalCode | undefined> {
    return this.clinicalCodes.get(id);
  }

  async getAllClinicalCodes(): Promise<ClinicalCode[]> {
    return Array.from(this.clinicalCodes.values());
  }

  async getClinicalCodesByType(codeType: CodeType): Promise<ClinicalCode[]> {
    return Array.from(this.clinicalCodes.values()).filter(
      (code) => code.codeType === codeType
    );
  }

  async createClinicalCode(insertCode: InsertClinicalCode): Promise<ClinicalCode> {
    const id = randomUUID();
    const now = new Date();
    const code: ClinicalCode = {
      ...insertCode,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.clinicalCodes.set(id, code);
    return code;
  }

  async createClinicalCodes(insertCodes: InsertClinicalCode[]): Promise<ClinicalCode[]> {
    const results: ClinicalCode[] = [];
    for (const insertCode of insertCodes) {
      const code = await this.createClinicalCode(insertCode);
      results.push(code);
    }
    return results;
  }

  async searchClinicalCodes(query: string, codeType?: CodeType): Promise<SearchResult[]> {
    const allCodes = codeType 
      ? await this.getClinicalCodesByType(codeType)
      : await this.getAllClinicalCodes();

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase().trim();

    for (const code of allCodes) {
      let matchScore = 0;
      let matchType: 'exact' | 'fuzzy' | 'synonym' = 'fuzzy';

      // Exact code match
      if (code.code.toLowerCase() === queryLower) {
        matchScore = 100;
        matchType = 'exact';
      }
      // Exact description match
      else if (code.description.toLowerCase() === queryLower) {
        matchScore = 95;
        matchType = 'exact';
      }
      // Synonym match
      else if (code.synonyms?.some(synonym => synonym.toLowerCase() === queryLower)) {
        matchScore = 90;
        matchType = 'synonym';
      }
      // Partial code match
      else if (code.code.toLowerCase().includes(queryLower)) {
        matchScore = 85;
      }
      // Partial description match
      else if (code.description.toLowerCase().includes(queryLower)) {
        matchScore = Math.max(60, 80 - (code.description.length - queryLower.length) * 0.5);
      }
      // Synonym partial match
      else if (code.synonyms?.some(synonym => synonym.toLowerCase().includes(queryLower))) {
        matchScore = 70;
        matchType = 'synonym';
      }
      // Word boundary matches in description
      else {
        const words = queryLower.split(/\s+/);
        const descWords = code.description.toLowerCase().split(/\s+/);
        const matchingWords = words.filter(word => 
          descWords.some(descWord => descWord.includes(word) || word.includes(descWord))
        );
        
        if (matchingWords.length > 0) {
          matchScore = Math.max(30, (matchingWords.length / words.length) * 50);
        }
      }

      if (matchScore > 0) {
        results.push({
          ...code,
          matchScore: Math.round(matchScore),
          matchType,
        });
      }
    }

    // Sort by match score descending
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  async createSearchHistory(insertHistory: InsertSearchHistory): Promise<SearchHistory> {
    const id = randomUUID();
    const history: SearchHistory = {
      ...insertHistory,
      id,
      timestamp: new Date(),
    };
    this.searchHistory.set(id, history);
    return history;
  }

  async getRecentSearchHistory(limit = 10): Promise<SearchHistory[]> {
    const histories = Array.from(this.searchHistory.values());
    return histories
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getCodeTypeStats(): Promise<Record<CodeType, number>> {
    const codes = await this.getAllClinicalCodes();
    const stats: Record<string, number> = {};
    
    for (const code of codes) {
      stats[code.codeType] = (stats[code.codeType] || 0) + 1;
    }
    
    return stats as Record<CodeType, number>;
  }
}

export class PostgresStorage implements IStorage {
  private db: any;

  constructor() {
    const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_R9b3nAIVqtmZ@ep-twilight-flower-acst0c0d-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getClinicalCode(id: string): Promise<ClinicalCode | undefined> {
    const result = await this.db.select().from(clinicalCodes).where(eq(clinicalCodes.id, id)).limit(1);
    return result[0];
  }

  async getAllClinicalCodes(): Promise<ClinicalCode[]> {
    return await this.db.select().from(clinicalCodes).orderBy(desc(clinicalCodes.createdAt));
  }

  async getClinicalCodesByType(codeType: CodeType): Promise<ClinicalCode[]> {
    return await this.db.select().from(clinicalCodes).where(eq(clinicalCodes.codeType, codeType)).orderBy(desc(clinicalCodes.createdAt));
  }

  async createClinicalCode(insertCode: InsertClinicalCode): Promise<ClinicalCode> {
    const result = await this.db.insert(clinicalCodes).values(insertCode).returning();
    return result[0];
  }

  async createClinicalCodes(insertCodes: InsertClinicalCode[]): Promise<ClinicalCode[]> {
    const results: ClinicalCode[] = [];
    for (const insertCode of insertCodes) {
      const code = await this.createClinicalCode(insertCode);
      results.push(code);
    }
    return results;
  }

  async searchClinicalCodes(query: string, codeType?: CodeType): Promise<SearchResult[]> {
    const queryLower = query.toLowerCase().trim();
    
    let baseQuery = this.db.select().from(clinicalCodes);
    
    if (codeType) {
      baseQuery = baseQuery.where(eq(clinicalCodes.codeType, codeType));
    }
    
    const allCodes = await baseQuery.orderBy(desc(clinicalCodes.createdAt));
    
    const results: SearchResult[] = [];

    for (const code of allCodes) {
      let matchScore = 0;
      let matchType: 'exact' | 'fuzzy' | 'synonym' = 'fuzzy';

      // Exact code match
      if (code.code.toLowerCase() === queryLower) {
        matchScore = 100;
        matchType = 'exact';
      }
      // Exact description match
      else if (code.description.toLowerCase() === queryLower) {
        matchScore = 95;
        matchType = 'exact';
      }
      // Synonym match
      else if (code.synonyms?.some(synonym => synonym.toLowerCase() === queryLower)) {
        matchScore = 90;
        matchType = 'synonym';
      }
      // Partial code match
      else if (code.code.toLowerCase().includes(queryLower)) {
        matchScore = 85;
      }
      // Partial description match
      else if (code.description.toLowerCase().includes(queryLower)) {
        matchScore = Math.max(60, 80 - (code.description.length - queryLower.length) * 0.5);
      }
      // Synonym partial match
      else if (code.synonyms?.some(synonym => synonym.toLowerCase().includes(queryLower))) {
        matchScore = 70;
        matchType = 'synonym';
      }
      // Word boundary matches in description
      else {
        const words = queryLower.split(/\s+/);
        const descWords = code.description.toLowerCase().split(/\s+/);
        const matchingWords = words.filter(word => 
          descWords.some(descWord => descWord.includes(word) || word.includes(descWord))
        );
        
        if (matchingWords.length > 0) {
          matchScore = Math.max(30, (matchingWords.length / words.length) * 50);
        }
      }

      if (matchScore > 0) {
        results.push({
          ...code,
          matchScore: Math.round(matchScore),
          matchType,
        });
      }
    }

    // Sort by match score descending
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  async createSearchHistory(insertHistory: InsertSearchHistory): Promise<SearchHistory> {
    const result = await this.db.insert(searchHistory).values(insertHistory).returning();
    return result[0];
  }

  async getRecentSearchHistory(limit = 10): Promise<SearchHistory[]> {
    return await this.db.select().from(searchHistory).orderBy(desc(searchHistory.timestamp)).limit(limit);
  }

  async getCodeTypeStats(): Promise<Record<CodeType, number>> {
    const codes = await this.getAllClinicalCodes();
    const stats: Record<string, number> = {};
    
    for (const code of codes) {
      stats[code.codeType] = (stats[code.codeType] || 0) + 1;
    }
    
    return stats as Record<CodeType, number>;
  }
}

// Use PostgreSQL storage if DATABASE_URL is available, otherwise fall back to in-memory storage
const usePostgres = !!process.env.DATABASE_URL;
console.log(`🗄️  Database Storage: ${usePostgres ? 'PostgreSQL (Neon)' : 'In-Memory (Development)'}`);
console.log(`🔗 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);

export const storage = usePostgres 
  ? new PostgresStorage() 
  : new MemStorage();
