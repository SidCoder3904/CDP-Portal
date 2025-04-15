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
import { Search, Filter, Download, Loader2 } from "lucide-react";
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

export function JobApplicants({ jobId }: JobApplicantsProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setApplications] = useState<any>([]);

  const jobsApi = useJobsApi();
  const { fetchWithAuth } = useApi();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const applicationData = await jobsApi.getJobApplications(jobId);
        console.log(applicationData);
        setApplications(applicationData);
      } catch (error) {
        console.error("Failed to fetch data:", error);

      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [jobId]);

  const toggleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((student:any) => student.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(
        selectedStudents.filter((studentId) => studentId !== id)
      );
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const updateStatus = (status: string) => {
    // In a real app, this would update the status in the database
    console.log(`Updating status to ${status} for students:`, selectedStudents);
    setSelectedStatus(null);
  };

  // Filter students based on search term and status
  const filteredStudents = students.filter((student:any) => {
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
        studentIds: selectedStudents.length > 0 ? selectedStudents : undefined,
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {selectedStudents.length > 0 ? (
            <span>{selectedStudents.length} students selected</span>
          ) : (
            <span>Total {students.length} applicants</span>
          )}
        </div>

        {selectedStudents.length > 0 && (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Application Status</DialogTitle>
                  <DialogDescription>
                    Change the status for {selectedStudents.length} selected
                    students.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Select onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedStatus(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      selectedStatus && updateStatus(selectedStatus)
                    }
                    disabled={!selectedStatus}
                  >
                    Update
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Move to Stage
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update Hiring Stage</DialogTitle>
                  <DialogDescription>
                    Move {selectedStudents.length} selected students to a
                    different stage.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resume">
                        Resume Shortlisting
                      </SelectItem>
                      <SelectItem value="online">Online Assessment</SelectItem>
                      <SelectItem value="technical">
                        Technical Interview
                      </SelectItem>
                      <SelectItem value="hr">HR Interview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Update</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                    selectedStudents.length === students.length &&
                    students.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>CGPA</TableHead>
              <TableHead>Current Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied On</TableHead>
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
              filteredStudents.map((student:any) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleSelectStudent(student.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.major}</TableCell>
                  <TableCell>{student.program}</TableCell>
                  <TableCell>{student.cgpa}</TableCell>
                  <TableCell>{student.currentStage}</TableCell>
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
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{student.appliedOn}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}