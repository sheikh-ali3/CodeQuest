import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClinicalCodeSchema, insertSearchHistorySchema, type CodeType, codeTypes } from "@shared/schema";
import multer from "multer";
import csvParser from "csv-parser";
import { Readable } from "stream";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Search endpoint
  app.post("/api/search", async (req, res) => {
    try {
      const { query, codeType } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required" });
      }

      if (codeType && !codeTypes.includes(codeType)) {
        return res.status(400).json({ message: "Invalid code type" });
      }

      const results = await storage.searchClinicalCodes(query.trim(), codeType);
      
      // Record search history
      await storage.createSearchHistory({
        query: query.trim(),
        resultsCount: results.length,
        searchType: 'description'
      });

      res.json({ results, total: results.length });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all clinical codes
  app.get("/api/codes", async (req, res) => {
    try {
      const { codeType } = req.query;
      
      let codes;
      if (codeType && typeof codeType === 'string') {
        if (!codeTypes.includes(codeType as CodeType)) {
          return res.status(400).json({ message: "Invalid code type" });
        }
        codes = await storage.getClinicalCodesByType(codeType as CodeType);
      } else {
        codes = await storage.getAllClinicalCodes();
      }
      
      res.json(codes);
    } catch (error) {
      console.error("Get codes error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get individual code details
  app.get("/api/codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const code = await storage.getClinicalCode(id);
      
      if (!code) {
        return res.status(404).json({ message: "Code not found" });
      }
      
      res.json(code);
    } catch (error) {
      console.error("Get code error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin upload clinical codes CSV
  app.post("/api/upload/data", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!req.file.originalname.endsWith('.csv')) {
        return res.status(400).json({ message: "Only CSV files are allowed" });
      }

      const codes: any[] = [];
      const stream = Readable.from(req.file.buffer);
      
      await new Promise((resolve, reject) => {
        stream
          .pipe(csvParser())
          .on('data', (data) => {
            try {
              // Parse synonyms if they exist
              const synonyms = data.synonyms ? 
                data.synonyms.split(';').map((s: string) => s.trim()).filter(Boolean) : 
                [];
              
              const code = {
                codeType: data.codeType || data.code_type,
                code: data.code,
                description: data.description,
                synonyms,
                category: data.category || null
              };

              // Validate the code data
              const validatedCode = insertClinicalCodeSchema.parse(code);
              codes.push(validatedCode);
            } catch (parseError) {
              console.error("Error parsing CSV row:", parseError, data);
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      if (codes.length === 0) {
        return res.status(400).json({ message: "No valid codes found in CSV file" });
      }

      const createdCodes = await storage.createClinicalCodes(codes);
      
      res.json({ 
        message: `Successfully uploaded ${createdCodes.length} codes`,
        count: createdCodes.length 
      });
    } catch (error) {
      console.error("Upload data error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bulk search via CSV upload
  app.post("/api/upload/search", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!req.file.originalname.endsWith('.csv')) {
        return res.status(400).json({ message: "Only CSV files are allowed" });
      }

      const queries: string[] = [];
      const stream = Readable.from(req.file.buffer);
      
      await new Promise((resolve, reject) => {
        stream
          .pipe(csvParser())
          .on('data', (data) => {
            // Accept either 'query', 'code', or 'description' column
            const query = data.query || data.code || data.description;
            if (query && typeof query === 'string') {
              queries.push(query.trim());
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      if (queries.length === 0) {
        return res.status(400).json({ message: "No valid queries found in CSV file" });
      }

      // Perform searches for all queries
      const allResults = [];
      for (const query of queries) {
        const results = await storage.searchClinicalCodes(query);
        allResults.push({
          query,
          results: results.slice(0, 5), // Limit to top 5 results per query
          count: results.length
        });
      }

      // Record bulk search history
      await storage.createSearchHistory({
        query: `Bulk search: ${queries.length} queries`,
        resultsCount: allResults.reduce((sum, r) => sum + r.count, 0),
        searchType: 'bulk'
      });

      res.json({ 
        searches: allResults,
        totalQueries: queries.length,
        totalResults: allResults.reduce((sum, r) => sum + r.count, 0)
      });
    } catch (error) {
      console.error("Bulk search error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get database statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getCodeTypeStats();
      const totalCodes = Object.values(stats).reduce((sum, count) => sum + count, 0);
      
      res.json({
        codeTypeStats: stats,
        totalCodes
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get recent search history
  app.get("/api/history", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;
      const history = await storage.getRecentSearchHistory(limitNum);
      res.json(history);
    } catch (error) {
      console.error("History error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
