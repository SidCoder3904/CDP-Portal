"use client"

import { Badge } from "@/components/ui/badge"

interface JobListing {
  id: string
  logo?: string
  title: string
  company: string
  location: string
  timePosted: string
  jobFunctions: string[]
  salary: string
  description: string[]
  status: string
  jobType: "Internship" | "Placement"
  degreesEligible: string[]
  branchesEligible: string[]
  batchesEligible: number[]
  cgpaCutoff: number
}

interface JobDetailsProps {
  job: JobListing
  activeTab?: "description" | "eligibility"
  handleTabClick: (tab: "description" | "eligibility") => void
}

function JobDetails({ job, activeTab = "description", handleTabClick }: JobDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
            {job.logo && (
              <img
                src={job.logo || "/placeholder.svg"}
                alt={`${job.company} logo`}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div>
            <h2 className="text-gray-700">{job.title}</h2>
            <p className="text-2xl text-template font-semibold">{job.company}</p>
            <p className="text-gray-500">
              {job.location} • {job.jobType}
            </p>
          </div>
        </div>
        <Badge
          variant={
            job.status === "Not Selected"
              ? "destructive"
              : job.status === "Yet to apply"
                ? "secondary"
                : job.status === "Applications closed"
                  ? "outline"
                  : "default"
          }
          className="text-xs"
        >
          {job.status}
        </Badge>
      </div>
      {/* Tabs */}
      <div className="flex border-b text-gray-500">
        <button
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === "description" ? "border-b-2 border-template text-template font-bold" : "hover:text-gray-700"
          }`}
          onClick={() => handleTabClick("description")}
        >
          Job Description
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${
            activeTab === "eligibility" ? "border-b-2 border-template text-template font-bold" : "hover:text-gray-700"
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
              <h4 className="font-semibold">Opening Overview</h4>
              <div className="grid gap-2 text-sm">
                <div className="grid grid-cols-1 gap-2">
                  <span className="text-muted-foreground">Job Functions:</span>
                  <span>{job.jobFunctions.join(", ")}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <span className="text-muted-foreground">Job Profile CTC:</span>
                  <span>{job.salary}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <h4 className="font-semibold">Job Description</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {job.description.map((desc, index) => (
                  <li key={index}>{desc}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-6">
            <div className="grid gap-2">
              <h4 className="font-semibold">Eligibility Overview</h4>
              <div className="grid gap-2 text-sm">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <span className="text-muted-foreground">Degrees Eligible:</span>
                  <span>{job.degreesEligible.join(", ")}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <span className="text-muted-foreground">Branches Eligible:</span>
                  <span>{job.branchesEligible.join(", ")}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <span className="text-muted-foreground">Batches Eligible:</span>
                  <span>{job.batchesEligible.join(", ")}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <span className="text-muted-foreground">CGPA Cutoff:</span>
                  <span>{job.cgpaCutoff}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDetails

