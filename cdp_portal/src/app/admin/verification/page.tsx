"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, AlertCircle } from "lucide-react"
import { useAdminApi, type StudentListItem, type StudentFilters } from "@/lib/api/admin"

export default function StudentsListPage() {
  const router = useRouter()
  const adminApi = useAdminApi()

  const [students, setStudents] = useState<StudentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalStudents, setTotalStudents] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(20)

  const [filters, setFilters] = useState<StudentFilters>({
    branch: "all",
    minCgpa: "any",
    rollNumber: "",
    page: 1,
    perPage: 20,
  })

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true)
        setError(null)

        const { students: fetchedStudents, total } = await adminApi.getStudents({
          ...filters,
          page: currentPage,
        })

        setStudents(fetchedStudents)
        setTotalStudents(total)
      } catch (err) {
        console.error("Failed to fetch students:", err)
        setError("Failed to load students. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [filters, currentPage])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const navigateToStudentDetails = (studentId: string) => {
    router.push(`/admin/verification${studentId}`)
  }

  const totalPages = Math.ceil(totalStudents / perPage)

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Student Management</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Branch</label>
              <Select value={filters.branch} onValueChange={(value) => handleFilterChange("branch", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="EE">EE</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Min CGPA</label>
              <Select value={filters.minCgpa} onValueChange={(value) => handleFilterChange("minCgpa", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any CGPA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any CGPA</SelectItem>
                  <SelectItem value="7.0">7.0+</SelectItem>
                  <SelectItem value="8.0">8.0+</SelectItem>
                  <SelectItem value="9.0">9.0+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Roll Number</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by roll number"
                  className="pl-8"
                  value={filters.rollNumber}
                  onChange={(e) => handleFilterChange("rollNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setFilters({
                    branch: "all",
                    minCgpa: "any",
                    rollNumber: "",
                    page: 1,
                    perPage: 20,
                  })
                }
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12 text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length > 0 ? (
                    students.map((student) => (
                        
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell>{student.cgpa}</TableCell>
                        <TableCell>{student.major}</TableCell>
                        <TableCell>
                          <Badge variant={student.isVerified ? "success" : "destructive"}>
                            {student.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => navigateToStudentDetails(student._id)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No students found matching the filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalStudents)} of{" "}
                    {totalStudents} students
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

