import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { CodeType, SearchHistory } from "@shared/schema";

const codeTypes: CodeType[] = ['ICD-10', 'ICD-9', 'CPT', 'HCPCS', 'SNOMED', 'LOINC', 'HCC'];

interface SearchInterfaceProps {
  onSearch: (query: string, codeType?: CodeType) => void;
  isSearching: boolean;
  recentSearches: SearchHistory[];
}

export default function SearchInterface({ onSearch, isSearching, recentSearches }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");
  const [selectedCodeType, setSelectedCodeType] = useState<CodeType | undefined>();

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), selectedCodeType);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRecentSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery, selectedCodeType);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Clinical Code Search</h2>
        <p className="text-slate-600">
          Search medical codes and descriptions across ICD-9, ICD-10, CPT, HCPCS, SNOMED, LOINC, and HCC systems
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Enter medical code (e.g., E11.9) or description (e.g., Type 2 Diabetes)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-12 pr-32 py-4 text-lg"
          />
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm font-medium text-slate-700 mr-2">Filter by code type:</span>
        {codeTypes.map((type) => (
          <Badge
            key={type}
            variant={selectedCodeType === type ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setSelectedCodeType(selectedCodeType === type ? undefined : type)}
          >
            {type}
          </Badge>
        ))}
        {selectedCodeType && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCodeType(undefined)}
            className="text-slate-500 text-sm"
          >
            Clear filter
          </Button>
        )}
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Recent Searches</h4>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <Button
                key={search.id}
                variant="outline"
                size="sm"
                onClick={() => handleRecentSearch(search.query)}
                className="text-sm"
              >
                {search.query}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
