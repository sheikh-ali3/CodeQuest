// Utility functions for search functionality
export interface SearchOptions {
  query: string;
  codeType?: string;
  exactMatch?: boolean;
}

export interface SearchMatch {
  score: number;
  type: 'exact' | 'fuzzy' | 'synonym';
  field: 'code' | 'description' | 'synonym';
}

// Simple string similarity calculation
export function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Levenshtein distance calculation
function getEditDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Tokenize and normalize search terms
export function normalizeSearchTerm(term: string): string {
  return term.toLowerCase().trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
}

// Extract search tokens
export function getSearchTokens(query: string): string[] {
  return normalizeSearchTerm(query).split(' ').filter(token => token.length > 0);
}

// Check if query appears to be a medical code
export function isLikelyCode(query: string): boolean {
  // Common medical code patterns
  const codePatterns = [
    /^[A-Z]\d+(\.\d+)?$/i, // ICD-10 pattern (E11.9)
    /^\d{3}(\.\d+)?$/,     // ICD-9 pattern (250.00)
    /^\d{5}$/,             // CPT pattern (99213)
    /^[A-Z]\d{4}$/i,       // HCPCS pattern
    /^\d+$/,               // Simple numeric codes
  ];
  
  return codePatterns.some(pattern => pattern.test(query.trim()));
}

// Format code for display
export function formatCode(code: string, codeType: string): string {
  switch (codeType) {
    case 'ICD-10':
    case 'ICD-9':
      return code.toUpperCase();
    case 'CPT':
    case 'HCPCS':
      return code;
    default:
      return code;
  }
}
