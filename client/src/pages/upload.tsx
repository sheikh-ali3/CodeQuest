import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Search, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  success: boolean;
  message: string;
  count?: number;
  searches?: any[];
}

export default function UploadPage() {
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [searchFile, setSearchFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const dataFileRef = useRef<HTMLInputElement>(null);
  const searchFileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDataUpload = async () => {
    if (!dataFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', dataFile);

    try {
      const response = await fetch('/api/upload/data', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Upload Successful",
          description: result.message,
        });
        setDataFile(null);
        if (dataFileRef.current) dataFileRef.current.value = '';
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBulkSearch = async () => {
    if (!searchFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', searchFile);

    try {
      const response = await fetch('/api/upload/search', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSearchResults(result.searches);
        toast({
          title: "Bulk Search Complete",
          description: `Processed ${result.totalQueries} queries with ${result.totalResults} total results`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Bulk Search Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload & Bulk Operations</h1>
          <p className="text-slate-600">Upload clinical code data or perform bulk searches using CSV files</p>
        </div>

        <Tabs defaultValue="data" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="data">Upload Code Data</TabsTrigger>
            <TabsTrigger value="search">Bulk Search</TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Clinical Code Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Upload CSV files containing clinical code data. Required columns: codeType, code, description. 
                    Optional columns: synonyms (semicolon-separated), category.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="data-file">Select CSV File</Label>
                    <Input
                      ref={dataFileRef}
                      id="data-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setDataFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  {dataFile && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-medium">{dataFile.name}</span>
                        <span className="text-sm text-slate-500">
                          ({(dataFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleDataUpload} 
                    disabled={!dataFile || uploading}
                    className="w-full"
                  >
                    {uploading ? "Uploading..." : "Upload Code Data"}
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">CSV Format Example:</h4>
                  <pre className="text-sm text-blue-800 overflow-x-auto">
{`codeType,code,description,synonyms,category
ICD-10,E11.9,Type 2 diabetes mellitus without complications,T2DM;Diabetes Type 2,Endocrine Disorders
CPT,99213,Office visit established patient level 3,Office visit;Established patient,Evaluation and Management`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Bulk Code Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Upload a CSV file with codes or descriptions to search. 
                    Use column headers: query, code, or description.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search-file">Select CSV File</Label>
                    <Input
                      ref={searchFileRef}
                      id="search-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setSearchFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  {searchFile && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-medium">{searchFile.name}</span>
                        <span className="text-sm text-slate-500">
                          ({(searchFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleBulkSearch} 
                    disabled={!searchFile || uploading}
                    className="w-full"
                  >
                    {uploading ? "Searching..." : "Perform Bulk Search"}
                  </Button>
                </div>

                {searchResults && (
                  <div className="mt-6">
                    <h4 className="font-medium text-slate-900 mb-4">Search Results</h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div key={index} className="p-4 border border-slate-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-900">Query: {result.query}</span>
                            <span className="text-sm text-slate-500">
                              {result.count} results found
                            </span>
                          </div>
                          {result.results.length > 0 && (
                            <div className="space-y-2">
                              {result.results.slice(0, 3).map((code: any, codeIndex: number) => (
                                <div key={codeIndex} className="text-sm bg-slate-50 p-2 rounded">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono">{code.code}</span>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {code.codeType}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 mt-1">{code.description}</p>
                                  <div className="flex items-center mt-1">
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mr-2">
                                      <div 
                                        className="bg-green-500 h-1.5 rounded-full" 
                                        style={{ width: `${code.matchScore}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-medium">{code.matchScore}%</span>
                                  </div>
                                </div>
                              ))}
                              {result.results.length > 3 && (
                                <p className="text-sm text-slate-500">
                                  ...and {result.results.length - 3} more results
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">CSV Format Example:</h4>
                  <pre className="text-sm text-green-800 overflow-x-auto">
{`query
E11.9
diabetes
hypertension
99213`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
