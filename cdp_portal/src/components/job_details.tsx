"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { JobListing } from "@/lib/api/jobs";
import { Icons } from "@/components/icons";
import ResumeSelectDialog from "@/components/resume-select-dialog";
import Image from "next/image";

interface JobDetailsProps {
  job: JobListing;
  activeTab?: "description" | "eligibility";
  handleTabClick: (tab: "description" | "eligibility") => void;
  onApply: (jobId: string, resumeId: string) => Promise<void>;
  isApplied: boolean;
  isApplying: boolean;
}

export default function JobDetails({
  job,
  activeTab = "description",
  handleTabClick,
  onApply,
  isApplied,
  isApplying,
}: JobDetailsProps) {
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);

  // Format job description as an array
  const jobDescriptionArray = Array.isArray(job.jobDescription)
    ? job.jobDescription
    : [job.jobDescription];

  // Format date for display
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Check if deadline has passed
  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  };

  const deadlinePassed = isDeadlinePassed(job.deadline);
  // If deadline passed, override the status to closed
  const displayStatus = deadlinePassed ? "closed" : job.status;

  const postedDate = job.createdAt ? formatDate(job.createdAt) : "";

  const handleApplyClick = () => {
    if (isApplied || isApplying || !job.isEligible || deadlinePassed) {
      return;
    }
    setIsResumeDialogOpen(true);
  };

  const handleResumeSubmit = async (resumeId: string) => {
    try {
      await onApply(job._id, resumeId);
      setIsResumeDialogOpen(false);
    } catch (error) {
      console.error("Error applying for job:", error);
      // Close the dialog even if there's an error
      setIsResumeDialogOpen(false);
    }
  };

  // Format deadline
  const formatDeadline = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
            {job.logo ? (
              <img
                src={job.logo}
                alt={`${job.company} logo`}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-xl font-semibold">
                {job.company?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-gray-700">{job.role}</h2>
            <p className="text-2xl text-template font-semibold">
              {job.company}
            </p>
            <p className="text-gray-500">
              {job.location} • {job.jobType || "Placement"} {"• "}
              {/* Only show the badge if the job is eligible */}
              {
                <Badge variant={"default"} className="text-xs bg-template">
                  {displayStatus}
                </Badge>
              }
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            onClick={handleApplyClick}
            disabled={
              displayStatus === "closed" ||
              !job.isEligible ||
              isApplied ||
              isApplying
            }
            className={`${
              displayStatus === "closed"
                ? "bg-gray-500 hover:bg-gray-500 cursor-not-allowed"
                : !job.isEligible
                ? "bg-red-500 hover:bg-red-500 cursor-not-allowed"
                : isApplied
                ? "bg-green-600 hover:bg-green-600 cursor-not-allowed"
                : "bg-[#002147] hover:bg-[#003167]"
            }`}
          >
            {displayStatus === "closed" ? (
              "Applications Closed"
            ) : !job.isEligible ? (
              "Not Eligible"
            ) : isApplying ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : isApplied ? (
              "Applied"
            ) : (
              "Apply Now"
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b text-gray-500">
        <button
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === "description"
              ? "border-b-2 border-template text-template font-bold"
              : "hover:text-gray-700"
          }`}
          onClick={() => handleTabClick("description")}
        >
          Job Description
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === "eligibility"
              ? "border-b-2 border-template text-template font-bold"
              : "hover:text-gray-700"
          }`}
          onClick={() => handleTabClick("eligibility")}
        >
          Eligibility Criteria
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: "300px" }}>
        {activeTab === "description" ? (
          <div className="grid gap-6 mt-4">
            <div className="grid gap-2">
              <h4 className="font-semibold text-template">Opening Overview</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">Package</p>
                  <p className="text-gray-700">{job.package} LPA</p>
                </div>

                {job.location && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="font-medium">Location</p>
                    <p className="text-gray-700">{job.location}</p>
                  </div>
                )}

                {job.deadline && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="font-medium">Application Deadline</p>
                    <p className="text-gray-700">
                      {formatDeadline(job.deadline)} 
                      {deadlinePassed && <span className="text-red-500 ml-1">(expired)</span>}
                    </p>
                  </div>
                )}

                {job.accommodation !== undefined && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="font-medium">Accommodation</p>
                    <p className="text-gray-700">
                      {job.accommodation ? "Provided" : "Not Provided"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <h4 className="font-semibold text-template">Job Description</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {Array.isArray(job.jobDescription) ? (
                  job.jobDescription.map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))
                ) : (
                  <li>{job.jobDescription}</li>
                )}
              </ul>
            </div>

            {job.hiringFlow && (
              <div className="grid gap-2">
                <h4 className="font-semibold text-template">Hiring Process</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {job.hiringFlow.map((step, index) => (
                    <li key={index}>
                      <span className="font-medium">{step.step}:</span>{" "}
                      {step.description}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 grid gap-6">
            <div className="grid gap-2">
              <h4 className="font-semibold text-template">
                Eligibility Overview
              </h4>
              <div className="grid gap-2 text-sm">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <span className="text-muted-foreground">
                    Branches Eligible:
                  </span>
                  <span>{job.eligibility?.branches?.join(", ")}</span>
                </div>
                {job.eligibility?.cgpa && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <span className="text-muted-foreground">CGPA Cutoff:</span>
                    <span>{job.eligibility.cgpa}+</span>
                  </div>
                )}
                {job.eligibility?.cgpaCriteria &&
                  !job.eligibility?.uniformCgpa && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-template">
                        Branch-wise CGPA Requirements:
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(job.eligibility.cgpaCriteria).map(
                          ([branch, cgpa]) => (
                            <div
                              key={branch}
                              className="p-3 bg-gray-50 rounded-md"
                            >
                              <p className="font-medium capitalize">{branch}</p>
                              {typeof cgpa === "object" ? (
                                <ul className="mt-1">
                                  {Object.entries(cgpa).map(
                                    ([program, value]) => (
                                      <li
                                        key={program}
                                        className="text-gray-700"
                                      >
                                        <span className="capitalize">
                                          {program}:
                                        </span>{" "}
                                        {value}
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                <p className="text-gray-700 mt-1">
                                  CGPA: {cgpa}+
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ResumeSelectDialog
        isOpen={isResumeDialogOpen}
        onClose={() => setIsResumeDialogOpen(false)}
        onSubmit={handleResumeSubmit}
        isSubmitting={isApplying}
      />
    </div>
  );
}
