"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/context/protected-routes";
import JobList from "@/components/company_list";
import JobDetails from "@/components/job_details";
import { useJobsApi, JobListing, JobApplication } from "@/lib/api/jobs";
import { Icons } from "@/components/icons";

export default function JobListings() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<{
    [key: string]: "description" | "eligibility";
  }>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  const jobsApi = useJobsApi();

  // Create a Set of job IDs that the student has applied to
  const appliedJobs: Set<string> = new Set(
    applications
      .map((app) => app.jobId || (app.job ? app.job._id : null))
      .filter((id): id is string => id !== null && id !== undefined)
  );

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [jobsData, applicationsData] = await Promise.all([
          jobsApi.getJobs(),
          jobsApi.getMyApplications(),
        ]);

        console.log(jobsData);

        setJobs(jobsData);
        setApplications(applicationsData);

        if (jobsData.length > 0 && !activeJobId) {
          setActiveJobId(jobsData[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleTabClick = (
    jobId: string,
    tab: "description" | "eligibility"
  ) => {
    setActiveTab((prev) => ({ ...prev, [jobId]: tab }));
  };

  const handleJobClick = (jobId: string) => {
    setActiveJobId(jobId);
  };

  const handleApplyForJob = async (jobId: string, resumeId: string) => {
    try {
      console.log(`Applying for job ${jobId} with resume ${resumeId}`);
      setIsApplying(true);

      if (!resumeId || resumeId === "None" || resumeId === "undefined") {
        throw new Error("Invalid resume ID");
      }

      const result = await jobsApi.applyForJob(jobId, resumeId);
      console.log("Application result:", result);

      // Update applications list
      const newApplications = await jobsApi.getMyApplications();
      setApplications(newApplications);

      // Update the jobs array to mark this job as applied
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId ? { ...job, hasApplied: true } : job
        )
      );

      // Update UI to show the job as applied
      appliedJobs.add(jobId);
    } catch (error) {
      console.error("Failed to apply for job:", error);
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading jobs...</span>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="flex bg-gray-100">
        {/* Job List */}
        <JobList
          jobs={jobs}
          activeJobId={activeJobId}
          onJobClick={handleJobClick}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          appliedJobs={appliedJobs}
        />

        {/* Job Details */}
        <div
          className="w-3/4 p-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 2rem)" }}
        >
          {activeJobId && (
            <JobDetails
              job={jobs.find((job) => job._id === activeJobId)!}
              activeTab={activeTab[activeJobId]}
              handleTabClick={(tab) => handleTabClick(activeJobId, tab)}
              onApply={(jobId: string, resumeId: string) =>
                handleApplyForJob(jobId, resumeId)
              }
              isApplied={appliedJobs.has(activeJobId)}
              isApplying={isApplying}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
