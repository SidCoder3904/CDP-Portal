"use client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobListing {
  id: string;
  logo?: string; // Add logo field
  title: string;
  company: string;
  location: string;
  timePosted: string;
  jobFunctions: string[];
  salary: string;
  description: string[];
  status: string;
  jobType: "Internship" | "Placement"; // New field for job type
  degreesEligible: string[]; // Degrees eligible for the job
  branchesEligible: string[]; // Branches eligible for the job
  batchesEligible: number[]; // Updated to allow multiple batches
  cgpaCutoff: number; // CGPA cutoff for eligibility
}

interface JobListProps {
  jobs: JobListing[];
  activeJobId: string | null;
  onJobClick: (jobId: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  activeJobId,
  onJobClick,
  filterStatus,
  setFilterStatus,
}) => {
  const filteredJobs = jobs.filter((job) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "applied")
      return job.status !== "Yet to apply" && job.status !== "Applications closed";
    if (filterStatus === "not-applied") return job.status === "Yet to apply";
    if (filterStatus === "closed") return job.status === "Applications closed";
    return true;
  });

  return (
    <div
      className="w-1/4 bg-white p-4 border-r border-gray-300 overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 2rem)" }}
    >
      <div className="mb-4">
        <Select onValueChange={setFilterStatus} defaultValue="all">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="applied">Applied Jobs</SelectItem>
            <SelectItem value="not-applied">Not Applied Jobs</SelectItem>
            <SelectItem value="closed">Closed Applications</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <h2 className="text-2xl text-template font-semibold mb-4">
        Job Listings
      </h2>
      <ul className="space-y-2">
        {filteredJobs.map((job) => (
          <li
            key={job.id}
            className={`p-2 rounded-md cursor-pointer hover:bg-gray-200 ${
              activeJobId === job.id ? "bg-gray-200" : ""
            }`}
            onClick={() => onJobClick(job.id)}
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
                  {job.title} • {job.location} • {job.jobType}
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
