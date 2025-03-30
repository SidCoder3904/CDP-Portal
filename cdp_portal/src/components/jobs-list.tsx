"use client";
import Link from "next/link";
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
import { Search, Filter } from "lucide-react";
import React, { useEffect, useState } from "react";


interface JobsListProps {
  cycleId: string;
}

/**
 * Represents the shape of each job returned from the backend.
 */
interface Job {
  _id: { $oid: string }; // Correctly representing MongoDB ObjectId
  company: string;
  role: string;
  package: string;
  location: string;
  deadline: string;
  status: string;
  applicants: number;
  selected: number;
}

export function JobsList({ cycleId }: JobsListProps) {
  // Mock data - in a real app, this would be fetched based on the cycleId

  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (statusFilter !== "all") queryParams.append("status", statusFilter);
        if (searchTerm.trim()) queryParams.append("company", searchTerm.trim());
  
        const response = await fetch(
          `${backendUrl}/api/placement-cycles/${cycleId}/jobs?${queryParams.toString()}`
        );
  
        if (!response.ok) throw new Error("Failed to fetch jobs.");
  
        const data = await response.json();
        console.log("Fetched jobs:", data); // ✅ Log jobs
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
  
    fetchJobs();
  }, [cycleId, searchTerm, statusFilter]);
  

  
  

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs..."
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {jobs.length != 0 ?
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead>Selected</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job._id.$oid}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/placement_cycles/cycles/${cycleId}/jobs/${job._id.$oid}`}
                    className="hover:underline"
                  >
                    {job.company}
                  </Link>
                </TableCell>
                <TableCell>{job.role}</TableCell>
                <TableCell>{job.package}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>{job.deadline}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      job.status === "Open"
                        ? "default"
                        : job.status === "Closed"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>{job.applicants}</TableCell>
                <TableCell>{job.selected}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>:
      <div></div>
      }
    </div>
  );
}
