"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Download, Loader2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useJobsApi } from "@/lib/api/jobs";
import { useApi } from "@/lib/api";

interface JobApplicantsProps {
  jobId: string;
}

interface Applicant {
  _id: { $oid: string } | string;
  applicationId: { $oid: string } | string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  major: string;
  studentId: string;
  enrollmentYear: string;
  expectedGraduationYear: string;
  passportImage: string;
  cgpa: string | number;
  status?: string;
  currentStage?: string;
  appliedOn?: string;
}

export function JobApplicants({ jobId }: JobApplicantsProps) {
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setApplications] = useState<Applicant[]>([]);

  const jobsApi = useJobsApi();
  const { fetchWithAuth } = useApi();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const applicationData = await jobsApi.getJobApplications(jobId);
        console.log(applicationData);
        setApplications(applicationData as unknown as Applicant[]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [jobId]);

  const toggleSelectAll = () => {
    if (selectedApplications.length === students.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(students.map((student) => {
        // Get the application ID
        const appId = typeof student.applicationId === 'string' ? student.applicationId : student.applicationId.$oid;
        return appId;
      }));
    }
  };

  const toggleSelectStudent = (appId: string) => {
    if (selectedApplications.includes(appId)) {
      setSelectedApplications(
        selectedApplications.filter((id) => id !== appId)
      );
    } else {
      setSelectedApplications([...selectedApplications, appId]);
    }
  };

  // Filter students based on search term and status
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      student.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Function to handle exporting applicant data
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Prepare filters for the export
      const filters = {
        jobId: jobId,
        // If students are selected, include only those
        studentIds: selectedApplications.length > 0 ? selectedApplications : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      };
      
      // Call the backend report generation API
      const response = await fetchWithAuth('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'job_applicants',
          filters: filters,
          includeResumeLinks: true  // Tell the backend to include resume links
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.status}`);
      }
      
      const report = await response.json();
      
      // Now download the generated report
      const downloadResponse = await fetchWithAuth(`/api/reports/download/${report.id}?format=excel`, {
        method: 'GET'
      });
      
      if (!downloadResponse.ok) {
        throw new Error(`Failed to download report: ${downloadResponse.status}`);
      }
      
      // Convert the response to a blob
      const blob = await downloadResponse.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `job_applicants_${jobId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Add to the DOM and trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error("Failed to export data:", error);

    } finally {
      setIsExporting(false);
    }
  };

  // Update application status for selected students
  const updateApplicationStatus = async (status: string, currentStage: string = status) => {
    try {
      setIsUpdatingStatus(true);
      
      // Call the API to update status for each selected application
      // Status represents overall application state (selected, rejected, etc.)
      // while currentStage represents the specific hiring workflow step
      const promises = selectedApplications.map(appId => 
        jobsApi.updateApplicationStatus(appId, status, currentStage)
      );
      
      await Promise.all(promises);
      
      // Refresh the data
      const applicationData = await jobsApi.getJobApplications(jobId);
      setApplications(applicationData as unknown as Applicant[]);
      
      // Clear selection
      setSelectedApplications([]);
      setSelectedStatus(null);
      
    } catch (error) {
      console.error("Failed to update application status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {selectedApplications.length > 0 ? (
            <span>{selectedApplications.length} students selected</span>
          ) : (
            <span>Total {students.length} applicants</span>
          )}
        </div>

        {selectedApplications.length > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => updateApplicationStatus('selected', 'selected')}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Select Candidate
            </Button>
            
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport} 
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    selectedApplications.length === students.length &&
                    students.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>CGPA</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Hiring Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No applicants found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                // Get the application ID
                const appId = typeof student.applicationId === 'string' ? student.applicationId : student.applicationId.$oid;
                
                return (
                  <TableRow key={appId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedApplications.includes(appId)}
                        onCheckedChange={() => toggleSelectStudent(appId)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.major}</TableCell>
                    <TableCell>{student.cgpa}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.status === "Shortlisted"
                            ? "default"
                            : student.status === "Rejected"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {student.status || "Applied"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}