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
import { useApi } from "@/lib/api";

interface JobsListProps {
  cycleId: string;
}

/**
 * Represents the shape of each job returned from the backend.
 */
interface Job {
  _id: string | { $oid: string }; // Correctly representing MongoDB ObjectId
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
  const { fetchWithAuth } = useApi();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (statusFilter !== "all") queryParams.append("status", statusFilter);
        if (searchTerm.trim()) queryParams.append("company", searchTerm.trim());

        // Using fetchWithAuth instead of direct fetch
        // Note: removing /api/ prefix to match backend routes
        const response = await fetchWithAuth(
          `/api/placement-cycles/${cycleId}/jobs?${queryParams.toString()}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch jobs");
        }

        const data = await response.json();
        console.log("Fetched jobs:", data);
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [cycleId, searchTerm, statusFilter]);

  // Handler for updating the search term
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handler for updating the status filter
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs by company..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
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

      {isLoading ? (
        <div className="text-center py-4">Loading jobs...</div>
      ) : jobs.length > 0 ? (
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
              {jobs.map((job) => {
                const jobId =
                  typeof job._id === "string" ? job._id : job._id.$oid;

                return (
                  <TableRow
                    key={jobId}
                    className="hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Link
                      href={`/admin/placement_cycles/${cycleId}/jobs/${jobId}`}
                      className="contents"
                    >
                      <TableCell className="font-bold">{job.company}</TableCell>
                      <TableCell>{job.role}</TableCell>
                      <TableCell>{job.package}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{job.deadline}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            job.status.toLowerCase() === "open"
                              ? "default"
                              : job.status.toLowerCase() === "closed"
                              ? "secondary"
                              : "outline"
                          }
                          className="bg-template"
                        >
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{job.applicants || 0}</TableCell>
                      <TableCell>{job.selected || 0}</TableCell>
                    </Link>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-4">No jobs found</div>
      )}
    </div>
  );
}
