import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import type { SearchResult } from "@shared/schema";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  isLoading: boolean;
}

export default function SearchResults({ results, query, isLoading }: SearchResultsProps) {
  const getCodeTypeColor = (codeType: string) => {
    const colors: Record<string, string> = {
      'ICD-10': 'bg-blue-100 text-blue-800',
      'ICD-9': 'bg-green-100 text-green-800',
      'CPT': 'bg-purple-100 text-purple-800',
      'HCPCS': 'bg-yellow-100 text-yellow-800',
      'SNOMED': 'bg-indigo-100 text-indigo-800',
      'LOINC': 'bg-pink-100 text-pink-800',
      'HCC': 'bg-orange-100 text-orange-800',
    };
    return colors[codeType] || 'bg-gray-100 text-gray-800';
  };

  const exportResults = () => {
    const headers = ['Code System', 'Code', 'Description', 'Match Score', 'Category'];
    const csvContent = [
      headers.join(','),
      ...results.map(result => [
        result.codeType,
        result.code,
        `"${result.description.replace(/"/g, '""')}"`,
        result.matchScore,
        result.category || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${query}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 p-8 text-center">
        <p className="text-slate-600">Searching...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Search Results</h3>
            <p className="text-sm text-slate-600">
              Found {results.length} matches for "{query}"
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={exportResults} disabled={results.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-slate-500">No matching codes found. Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code System</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Match Score</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id} className="hover:bg-slate-50">
                  <TableCell>
                    <Badge className={getCodeTypeColor(result.codeType)}>
                      {result.codeType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-medium">{result.code}</TableCell>
                  <TableCell className="max-w-md">{result.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 min-w-[60px]">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${result.matchScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium min-w-[3ch]">
                        {result.matchScore}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{result.category}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
