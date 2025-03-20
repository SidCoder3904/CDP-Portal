"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobListing } from "@/lib/api/jobs";

interface JobListProps {
  jobs: JobListing[];
  activeJobId: string | null;
  onJobClick: (jobId: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  appliedJobs: Set<string>;
}

export default function JobList({
  jobs,
  activeJobId,
  onJobClick,
  filterStatus,
  setFilterStatus,
  appliedJobs
}: JobListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter jobs based on search term and status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "applied") return matchesSearch && appliedJobs.has(job._id);
    if (filterStatus === "not-applied") return matchesSearch && !appliedJobs.has(job._id);
    
    return matchesSearch;
  });

  return (
    <div className="w-1/3 bg-white border-r border-gray-200 p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 2rem)" }}>
      <div className="mb-4 space-y-3">
        <Input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="not-applied">Not Applied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              key={job._id}
              className={`p-3 rounded-md cursor-pointer transition-colors ${
                activeJobId === job._id
                  ? "bg-template text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => onJobClick(job._id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${activeJobId === job._id ? "text-white" : "text-gray-900"}`}>
                    {job.role}
                  </h3>
                  <p className={`text-sm ${activeJobId === job._id ? "text-white/90" : "text-gray-600"}`}>
                    {job.company}
                  </p>
                  <p className={`text-xs mt-1 ${activeJobId === job._id ? "text-white/80" : "text-gray-500"}`}>
                    {job.location}
                  </p>
                </div>
                {appliedJobs.has(job._id) && (
                  <div className={`text-xs px-2 py-1 rounded ${
                    activeJobId === job._id ? "bg-white/20" : "bg-green-100 text-green-800"
                  }`}>
                    Applied
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No jobs match your search criteria
          </div>
        )}
      </div>
    </div>
  );
}
