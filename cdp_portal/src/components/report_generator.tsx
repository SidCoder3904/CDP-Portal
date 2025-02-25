"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DataTable } from "./data_table"
import { FileSpreadsheet, FileText, Filter } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

const reportTypes = [
  {
    id: "placement-statistics",
    name: "Placement Statistics",
    description: "Overall placement statistics including package details and company information",
  },
  {
    id: "branch-wise",
    name: "Branch-wise Analysis",
    description: "Branch-wise placement and internship statistics",
  },
  {
    id: "company-wise",
    name: "Company-wise Report",
    description: "Company-wise recruitment data and offer details",
  },
  {
    id: "student-status",
    name: "Student Status Report",
    description: "Individual student placement/internship status",
  },
  {
    id: "compensation",
    name: "Compensation Analysis",
    description: "Detailed analysis of packages and compensation",
  },
]

const placementCycles = [
  { id: "placement-2024", name: "Placements 2024" },
  { id: "internship-2024", name: "Internship 2024" },
  { id: "placement-2023", name: "Placements 2023" },
  { id: "internship-2023", name: "Internship 2023" },
]

export function ReportGenerator() {
  const [selectedReport, setSelectedReport] = useState("")
  const [selectedCycle, setSelectedCycle] = useState("")
  const [filters, setFilters] = useState({
    branches: [] as string[],
    companies: [] as string[],
    minPackage: "",
    maxPackage: "",
    status: [] as string[],
  })

  // Sample data - replace with actual data from your backend
  const data = [
    {
      id: 1,
      name: "John Doe",
      branch: "Computer Science",
      company: "Tech Corp",
      package: "15 LPA",
      status: "Placed",
    },
    {
      id: 2,
      name: "Jane Smith",
      branch: "Electronics",
      company: "Innovation Inc",
      package: "12 LPA",
      status: "Placed",
    },
    // Add more sample data...
  ]

  const columns = [
    { header: "Name", accessorKey: "name" },
    { header: "Branch", accessorKey: "branch" },
    { header: "Company", accessorKey: "company" },
    { header: "Package", accessorKey: "package" },
    { header: "Status", accessorKey: "status" },
  ]

  const handleExport = (format: "excel" | "pdf") => {
    // Implement export functionality
    console.log(`Exporting as ${format}...`)
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

      {selectedReport && selectedCycle && (
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
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <StatsCard title="Total Students" value="450" />
                <StatsCard title="Placed Students" value="380" />
                <StatsCard title="Average Package" value="12.5 LPA" />
                <StatsCard title="Highest Package" value="45 LPA" />
              </div>
            </CardContent>
          </Card>
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

