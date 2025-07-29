import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Upload, Download, Settings, FileText, Users, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { ClinicalCode } from "@shared/schema";

export default function AdminPage() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: codes } = useQuery<ClinicalCode[]>({
    queryKey: ["/api/codes"],
  });

  const { data: history } = useQuery({
    queryKey: ["/api/history"],
    queryFn: () => fetch("/api/history?limit=20").then(res => res.json()),
  });

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

  const exportData = async () => {
    try {
      const response = await fetch('/api/codes');
      const data = await response.json();
      
      // Convert to CSV
      const headers = ['codeType', 'code', 'description', 'synonyms', 'category'];
      const csvContent = [
        headers.join(','),
        ...data.map((code: ClinicalCode) => [
          code.codeType,
          code.code,
          `"${code.description.replace(/"/g, '""')}"`,
          `"${(code.synonyms || []).join(';')}"`,
          code.category || ''
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clinical-codes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage clinical code data and system settings</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Codes</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats?.totalCodes || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Recent Searches</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {history?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Code Systems</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats ? Object.keys(stats.codeTypeStats || {}).length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Type Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Code System Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.codeTypeStats && Object.entries(stats.codeTypeStats).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getCodeTypeColor(type)}>{type}</Badge>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={exportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Data
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Data
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Database Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Clinical Codes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Clinical Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code System</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes?.slice(0, 10).map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <Badge className={getCodeTypeColor(code.codeType)}>
                        {code.codeType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{code.code}</TableCell>
                    <TableCell className="max-w-md truncate">{code.description}</TableCell>
                    <TableCell>{code.category}</TableCell>
                    <TableCell>{code.createdAt ? new Date(code.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Search History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Search Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history?.map((search: any) => (
                  <TableRow key={search.id}>
                    <TableCell className="max-w-md truncate">{search.query}</TableCell>
                    <TableCell>{search.resultsCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{search.searchType}</Badge>
                    </TableCell>
                    <TableCell>{new Date(search.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
