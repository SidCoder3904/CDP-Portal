"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DataTable } from "./data_table"
import { FileSpreadsheet, FileText, Filter, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useApi } from "@/lib/api"

interface ReportType {
  id: string;
  name: string;
  description: string;
}

interface PlacementCycle {
  id: string;
  name: string;
}

export function ReportGenerator() {
  const { fetchWithAuth } = useApi();
  const { fetchWithAuth } = useApi();
  const [selectedReport, setSelectedReport] = useState("")
  const [selectedCycle, setSelectedCycle] = useState("")
  const [reportTypes, setReportTypes] = useState<ReportType[]>([])
  const [placementCycles, setPlacementCycles] = useState<PlacementCycle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<any[]>([])
  const [reportId, setReportId] = useState<string | null>(null)
  const [reportSummary, setReportSummary] = useState<any>(null)
  const [filters, setFilters] = useState({
    branches: [] as string[],
    companies: [] as string[],
    minPackage: "",
    maxPackage: "",
    status: [] as string[],
  })
  const [isExporting, setIsExporting] = useState(false)

  // Fetch report types and placement cycles when component mounts
  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        const response = await fetchWithAuth('/api/reports/types');
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to fetch report types');
        }
        const data = await response.json();
        setReportTypes(data);
      } catch (error) {
        console.error("Error fetching report types:", error);
      }
    }

    const fetchPlacementCycles = async () => {
      try {
        const response = await fetchWithAuth('/api/placement-cycles');
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to fetch placement cycles');
        }
        const data = await response.json();
        setPlacementCycles(data.map((cycle: any) => ({
          id: cycle.id,
          name: cycle.name
        })));
      } catch (error) {
        console.error("Error fetching placement cycles:", error);
      }
    }

    fetchReportTypes();
    fetchPlacementCycles();
  }, []);

  // Generate report based on selected type and cycle
  const generateReport = async () => {
    if (!selectedReport || !selectedCycle) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetchWithAuth('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: selectedReport,
          filters: {
            cycleId: selectedCycle,
            branches: filters.branches.length > 0 ? filters.branches : undefined,
            companies: filters.companies.length > 0 ? filters.companies : undefined,
            minPackage: filters.minPackage || undefined,
            maxPackage: filters.maxPackage || undefined,
            status: filters.status.length > 0 ? filters.status : undefined
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate report');
      }
      
      const data = await response.json();
      console.log(data);
      setReportId(data.id);
      setReportData(data.data || []);
      
      // Extract summary data if available
      if (data.summary) {
        setReportSummary(data.summary);
      } else {
        // If no summary is provided, create a basic one based on the data
        setReportSummary({
          totalStudents: data.data?.length || 0,
          placedStudents: data.data?.filter((item: any) => item.status === "Placed").length || 0,
          averagePackage: data.data?.reduce((sum: number, item: any) => sum + (parseFloat(item.package) || 0), 0) / (data.data?.length || 1),
          highestPackage: Math.max(...(data.data?.map((item: any) => parseFloat(item.package) || 0) || [0]))
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Export report
  const handleExport = async (format: "excel" | "pdf") => {
    if (!reportId) {
      console.error("Export failed: reportId is null.");
      alert("Cannot export: Report ID is missing. Please generate the report again.");
      return;
    }

    console.log(`Attempting to export report ${reportId} as ${format}`);
    setIsExporting(true);

    try {
      // Corrected path - removed /api prefix to match backend routes
      const response = await fetchWithAuth(`/api/reports/download/${reportId}?format=${format}`, {
        method: 'GET',
      });

      if (!response.ok) {
        // Try to get more specific error from backend if possible
        let errorMsg = `Failed to download report. Status: ${response.status}`;
        try {
            const errorData = await response.json(); // Try to parse error json
            errorMsg = errorData.message || errorMsg;
        } catch (e) {
            // If response is not json, use status text
            errorMsg = `${errorMsg} - ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      // Get the blob directly from the response
      const blob = await response.blob();

       // Check if the blob is valid
       if (blob.size === 0) {
           throw new Error("Received empty file from server. Check backend logs.");
       }
       console.log(`Blob received: size=${blob.size}, type=${blob.type}`);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none'; // Hide the link
      a.href = url;

      // Construct filename safely - Use info from state if available
      const reportName = reportTypes.find(rt => rt.id === selectedReport)?.name || selectedReport || 'report';
      const cycleName = placementCycles.find(pc => pc.id === selectedCycle)?.name || selectedCycle || 'cycle';
      const timestamp = new Date().toISOString().split('T')[0];
      // Note: Backend currently generates CSV for PDF. Adjust extension if backend changes.
      const extension = format === 'excel' ? 'xlsx' : 'csv'; // Use 'pdf' if backend generates actual PDFs
      a.download = `${reportName}_${cycleName}_${timestamp}.${extension}`;

      // Trigger download
      document.body.appendChild(a); // Append the link to the body
      a.click();                  // Simulate a click

      // Clean up: remove the link and revoke the object URL
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error: any) {
      console.error(`Error exporting report as ${format}:`, error);
      // Display error to the user
      alert(`Failed to export report: ${error.message}`);
    } finally {
      setIsExporting(false); // Reset loading state
    }
  }

  // Map report data to table columns
  const getColumnsFromData = () => {
    if (!reportData || reportData.length === 0) return [];
    
    return Object.keys(reportData[0]).map(key => ({
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
      accessorKey: key
    }));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Placement Cycle</Label>
          <Select value={selectedCycle} onValueChange={setSelectedCycle}>
            <SelectTrigger>
              <SelectValue placeholder="Select placement cycle" />
            </SelectTrigger>
            <SelectContent>
              {placementCycles.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={generateReport} 
          disabled={!selectedReport || !selectedCycle || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            'Generate Report'
          )}
        </Button>
      </div>

      {reportData.length > 0 && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Report Preview</CardTitle>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Report Filters</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-full">
                      <div className="space-y-6 pr-6 pt-4">
                        <div className="space-y-2">
                          <Label>Branches</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["CSE", "ECE", "ME", "CE", "EE", "CH"].map((branch) => (
                              <div key={branch} className="flex items-center space-x-2">
                                <Checkbox
                                  id={branch}
                                  checked={filters.branches.includes(branch)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFilters({
                                        ...filters,
                                        branches: [...filters.branches, branch],
                                      })
                                    } else {
                                      setFilters({
                                        ...filters,
                                        branches: filters.branches.filter((b) => b !== branch),
                                      })
                                    }
                                  }}
                                />
                                <Label htmlFor={branch}>{branch}</Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Package Range (LPA)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Min</Label>
                              <Input
                                type="number"
                                value={filters.minPackage}
                                onChange={(e) => setFilters({ ...filters, minPackage: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Max</Label>
                              <Input
                                type="number"
                                value={filters.maxPackage}
                                onChange={(e) => setFilters({ ...filters, maxPackage: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Status</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["Placed", "Unplaced", "In Process", "Offer Received"].map((status) => (
                              <div key={status} className="flex items-center space-x-2">
                                <Checkbox
                                  id={status}
                                  checked={filters.status.includes(status)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFilters({
                                        ...filters,
                                        status: [...filters.status, status],
                                      })
                                    } else {
                                      setFilters({
                                        ...filters,
                                        status: filters.status.filter((s) => s !== status),
                                      })
                                    }
                                  }}
                                />
                                <Label htmlFor={status}>{status}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={generateReport}
                          disabled={isLoading}
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleExport("excel")}
                  disabled={isExporting || isLoading}
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  )}
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleExport("pdf")}
                  disabled={isExporting || isLoading}
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                  <FileText className="mr-2 h-4 w-4" />
                  )}
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={getColumnsFromData()} 
                data={reportData} 
              />
            </CardContent>
          </Card>

          {reportSummary && (
          <Card>
            <CardHeader>
              <CardTitle>Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                  <StatsCard title="Total Students" value={reportSummary.totalStudents.toString()} />
                  <StatsCard title="Placed Students" value={reportSummary.placedStudents.toString()} />
                  <StatsCard title="Average Package" value={`${reportSummary.averagePackage.toFixed(2)} LPA`} />
                  <StatsCard title="Highest Package" value={`${reportSummary.highestPackage} LPA`} />
              </div>
            </CardContent>
          </Card>
          )}
        </>
      )}
    </div>
  )
}

function StatsCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  )
}