import Header from "@/components/header";
import Footer from "@/components/footer";
import SearchInterface from "@/components/search-interface";
import SearchResults from "@/components/search-results";
import QuickActions from "@/components/quick-actions";
import RecentActivity from "@/components/recent-activity";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SearchResult, CodeType } from "@shared/schema";

interface SearchState {
  query: string;
  codeType?: CodeType;
  results: SearchResult[];
  isSearching: boolean;
  hasSearched: boolean;
}

export default function SearchPage() {
  const [searchState, setSearchState] = useState<SearchState>({
    query: "",
    results: [],
    isSearching: false,
    hasSearched: false,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: history } = useQuery({
    queryKey: ["/api/history"],
  });

  const handleSearch = async (query: string, codeType?: CodeType) => {
    if (!query.trim()) return;

    setSearchState(prev => ({ ...prev, isSearching: true, query, codeType }));

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, codeType }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setSearchState(prev => ({
        ...prev,
        results: data.results,
        isSearching: false,
        hasSearched: true,
      }));
    } catch (error) {
      console.error("Search error:", error);
      setSearchState(prev => ({
        ...prev,
        results: [],
        isSearching: false,
        hasSearched: true,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchInterface 
          onSearch={handleSearch}
          isSearching={searchState.isSearching}
          recentSearches={history?.slice(0, 4) || []}
        />
        
        {searchState.hasSearched && (
          <SearchResults 
            results={searchState.results}
            query={searchState.query}
            isLoading={searchState.isSearching}
          />
        )}
        
        <QuickActions stats={stats} />
        
        <RecentActivity history={history || []} />
      </main>
      
      <Footer />
    </div>
  );
}
