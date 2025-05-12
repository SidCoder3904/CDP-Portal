"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, AlertCircle } from "lucide-react";
import {
  useAdminApi,
  type StudentListItem,
  type StudentFilters,
} from "@/lib/api/admin";

interface VerificationStatus {
  [key: string]: string;
}

interface EducationItem {
  is_verified: boolean;
}

interface ExperienceItem {
  is_verified: boolean;
}

interface PositionItem {
  is_verified: boolean;
}

interface ProjectItem {
  is_verified: boolean;
}

// Add helper function to check if student is fully verified
const isStudentFullyVerified = (student: StudentListItem) => {
  // For now, just check if the student has isVerified flag
  // This will be updated when the API returns full verification data
  return student.isVerified;
};

export default function StudentsListPage() {
  const router = useRouter();
  const adminApi = useAdminApi();

  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);

  const [filterInputs, setFilterInputs] = useState({
    branch: "all",
    minCgpa: "any",
    rollNumber: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    branch: "all",
    minCgpa: "any",
    rollNumber: "",
  });

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        setError(null);

        const { students: fetchedStudents, total } = await adminApi.getStudents(
          {
            ...appliedFilters,
            page: currentPage,
          }
        );

        setStudents(fetchedStudents);
        setTotalStudents(total);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setError("Failed to load students. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [appliedFilters, currentPage]);

  const handleFilterInputChange = (key: string, value: string) => {
    setFilterInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filterInputs);
    setCurrentPage(1); // Reset to first page when applying new filters
  };

  const handleResetFilters = () => {
    const resetFilters = {
      branch: "all",
      minCgpa: "any",
      rollNumber: "",
    };
    setFilterInputs(resetFilters);
    setAppliedFilters(resetFilters);
    setCurrentPage(1);
  };

  const navigateToStudentDetails = (student_id: string) => {
    router.push(`/admin/verification/${student_id}`);
  };

  const totalPages = Math.ceil(totalStudents / perPage);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight text-template py-4">
        Student Verification
      </h1>

      <Card className="mb-6">
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Branch</label>
              <Select
                value={filterInputs.branch}
                onValueChange={(value) =>
                  handleFilterInputChange("branch", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="CSE">Computer Science</SelectItem>
                  <SelectItem value="EE">Electrical Engineering</SelectItem>
                  <SelectItem value="CE">Civil Engineering</SelectItem>
                  <SelectItem value="ME">Mechanical Engineering</SelectItem>
                  <SelectItem value="CH">Chemical Engineering</SelectItem>
                  <SelectItem value="MM">Metallurgical Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Min CGPA</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="Enter minimum CGPA"
                value={
                  filterInputs.minCgpa === "any" ? "" : filterInputs.minCgpa
                }
                onChange={(e) =>
                  handleFilterInputChange("minCgpa", e.target.value || "any")
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Roll Number
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by roll number"
                  className="pl-8"
                  value={filterInputs.rollNumber}
                  onChange={(e) =>
                    handleFilterInputChange("rollNumber", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="default"
                className="flex-1"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleResetFilters}
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <TableRow
                        key={student._id}
                        onClick={() => navigateToStudentDetails(student._id)}
                        className="hover:bg-muted transition-colors cursor-pointer"
                      >
                        <TableCell className="font-bold">
                          {student.name}
                        </TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell>{student.cgpa}</TableCell>
                        <TableCell>{student.major}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No students found matching the filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * perPage + 1} to{" "}
                    {Math.min(currentPage * perPage, totalStudents)} of{" "}
                    {totalStudents} students
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
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
  );
}
