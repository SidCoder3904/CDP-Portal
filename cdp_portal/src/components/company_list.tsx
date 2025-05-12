"use client";
import { useState } from "react";
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

const JobList: React.FC<JobListProps> = ({
  jobs,
  activeJobId,
  onJobClick,
  filterStatus,
  setFilterStatus,
  appliedJobs,
}) => {
  const filteredJobs = jobs.filter((job) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "applied") return appliedJobs.has(job._id);
    if (filterStatus === "not-applied") return !appliedJobs.has(job._id);
    return true;
  });

  return (
    <div
      className="w-1/5 bg-gray-50 p-4 border-r border-gray-300 overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 2rem)" }}
    >
      <h2 className="text-2xl text-template font-bold mb-6">Job Listings</h2>
      <div className="mb-4">
        <Select onValueChange={setFilterStatus} defaultValue="all">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="applied">Applied Jobs</SelectItem>
            <SelectItem value="not-applied">Not Applied Jobs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ul className="space-y-2">
        {filteredJobs.map((job) => (
          <li
            key={job._id}
            className={`p-2 rounded-md cursor-pointer hover:bg-gray-200 ${
              activeJobId === job._id ? "bg-gray-200" : ""
            }`}
            onClick={() => onJobClick(job._id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                {job.logo && (
                  <img
                    src={job.logo || "/placeholder.svg"}
                    alt={`${job.company} logo`}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-left">{job.company}</h3>
                <p className="text-sm text-gray-500 text-left">
                  {job.role} • {job.location} • {job.jobType || "Placement"}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobList;
