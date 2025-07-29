import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, BarChart, Settings, FileText, CloudUpload } from "lucide-react";
import { Link } from "wouter";

interface QuickActionsProps {
  stats: any;
}

export default function QuickActions({ stats }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* CSV Upload Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <Upload className="text-primary text-xl mr-3" />
            <h3 className="text-lg font-semibold text-slate-900">Bulk Search</h3>
          </div>
          <p className="text-slate-600 text-sm mb-4">Upload a CSV file to search multiple codes at once</p>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer mb-4">
            <CloudUpload className="text-slate-400 text-2xl mb-2 mx-auto" />
            <p className="text-sm text-slate-600">Drag & drop your CSV file here or click to browse</p>
          </div>
          <Link href="/upload">
            <Button className="w-full">
              Upload & Search
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <BarChart className="text-green-600 text-xl mr-3" />
            <h3 className="text-lg font-semibold text-slate-900">Database Stats</h3>
          </div>
          <div className="space-y-3">
            {stats?.codeTypeStats && Object.entries(stats.codeTypeStats).slice(0, 4).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-slate-600">{type}</span>
                <span className="text-sm font-medium text-slate-900">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Total Codes</span>
              <span className="text-lg font-bold text-primary">{stats?.totalCodes || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Tools Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center mb-4">
            <Settings className="text-amber-600 text-xl mr-3" />
            <h3 className="text-lg font-semibold text-slate-900">Admin Tools</h3>
          </div>
          <div className="space-y-3">
            <Link href="/admin">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Manage Code Data
              </Button>
            </Link>
            <Link href="/upload">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Upload History
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
