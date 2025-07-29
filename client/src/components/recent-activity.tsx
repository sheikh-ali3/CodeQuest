import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Upload, Database } from "lucide-react";
import type { SearchHistory } from "@shared/schema";

interface RecentActivityProps {
  history: SearchHistory[];
}

export default function RecentActivity({ history }: RecentActivityProps) {
  const getActivityIcon = (searchType: string) => {
    switch (searchType) {
      case 'bulk':
        return <Upload className="text-green-600" />;
      case 'code':
        return <Database className="text-amber-600" />;
      default:
        return <Search className="text-primary" />;
    }
  };

  const getActivityDescription = (search: SearchHistory) => {
    switch (search.searchType) {
      case 'bulk':
        return `Bulk search processed with ${search.resultsCount} total results`;
      case 'code':
        return `Code search found ${search.resultsCount} matches`;
      default:
        return `Found ${search.resultsCount} matches`;
    }
  };

  const formatTimeAgo = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-slate-200">
          {history.slice(0, 10).map((search) => (
            <div key={search.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  {getActivityIcon(search.searchType)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Searched for "{search.query}"
                  </p>
                  <p className="text-xs text-slate-500">
                    {getActivityDescription(search)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500">
                {formatTimeAgo(search.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
