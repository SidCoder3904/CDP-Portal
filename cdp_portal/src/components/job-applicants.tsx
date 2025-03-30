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
import { Search, Filter, Download } from "lucide-react";
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

interface JobApplicantsProps {
  jobId: string;
}

export function JobApplicants({ jobId }: JobApplicantsProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [students, setApplications] = useState<any>([]);


  const jobsApi = useJobsApi();

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
  }, []);

  // Mock data - in a real app, this would be fetched based on the jobId
  // const students = [
  //   {
  //     id: "S001",
  //     name: "Rahul Sharma",
  //     studentId: "CS19001",
  //     branch: "Computer Science",
  //     program: "B.Tech",
  //     cgpa: 9.2,
  //     status: "Shortlisted",
  //     currentStage: "Technical Interview",
  //     appliedOn: "Sep 28, 2023",
  //   },
  //   {
  //     id: "S002",
  //     name: "Priya Patel",
  //     studentId: "CS19045",
  //     branch: "Computer Science",
  //     program: "B.Tech",
  //     cgpa: 8.7,
  //     status: "In Progress",
  //     currentStage: "Online Assessment",
  //     appliedOn: "Sep 29, 2023",
  //   },
  //   {
  //     id: "S003",
  //     name: "Amit Kumar",
  //     studentId: "EC19023",
  //     branch: "Electronics",
  //     program: "B.Tech",
  //     cgpa: 8.9,
  //     status: "Rejected",
  //     currentStage: "Resume Shortlisting",
  //     appliedOn: "Sep 27, 2023",
  //   },
  //   {
  //     id: "S004",
  //     name: "Sneha Gupta",
  //     studentId: "ME19056",
  //     branch: "Mechanical",
  //     program: "B.Tech",
  //     cgpa: 8.5,
  //     status: "In Progress",
  //     currentStage: "Resume Shortlisting",
  //     appliedOn: "Sep 30, 2023",
  //   },
  //   {
  //     id: "S005",
  //     name: "Vikram Singh",
  //     studentId: "CS19078",
  //     branch: "Computer Science",
  //     program: "B.Tech",
  //     cgpa: 9.5,
  //     status: "Shortlisted",
  //     currentStage: "HR Interview",
  //     appliedOn: "Sep 26, 2023",
  //   },
  // ];

  const toggleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((student) => student.id));
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
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
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
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="resume">Resume Shortlisting</SelectItem>
              <SelectItem value="online">Online Assessment</SelectItem>
              <SelectItem value="technical">Technical Interview</SelectItem>
              <SelectItem value="hr">HR Interview</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
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
            {students.map((student) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
