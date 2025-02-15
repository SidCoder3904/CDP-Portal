"use client"

import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { useState, useEffect } from "react"

interface JobListing {
  id: string
  title: string
  company: string
  location: string
  timePosted: string
  jobFunctions: string[]
  salary: string
  description: string[]
  status: string
  jobType: "Internship" | "Placement" // New field for job type
  degreesEligible: string[]           // Degrees eligible for the job
  branchesEligible: string[]          // Branches eligible for the job
  batchesEligible: number[]           // Updated to allow multiple batches
  cgpaCutoff: number                  // CGPA cutoff for eligibility
}

const jobs: JobListing[] = [
  {
    id: "samsung-rd",
    title: "R&D Intern",
    company: "Samsung Research Institute Noida",
    location: "Noida",
    timePosted: "a day ago",
    jobFunctions: ["Engineering - Web / Software", "Information Technology", "Research"],
    salary: "₹50000 per Month",
    description: [
      "Standardize the software development process to meet the delivery, quality and cost of software.",
      "Monitor quality of software development outcomes and continue to improve the process.",
      "Understand and apply software process within the organization.",
      "Understand different development methodologies and apply to projects.",
      "Participate in process tailoring, review and inspection activities of software development tasks.",
    ],
    status: "Not Selected",
    jobType: "Internship",            // Added job type
    degreesEligible: ["B.Tech", "M.Tech", "PhD"],
    branchesEligible: ["CSE", "ECE", "IT"],
    batchesEligible: [2023, 2024],   // Updated to allow multiple batches
    cgpaCutoff: 7.5,
  },
  {
    id: "publicis",
    title: "Intern Engineering",
    company: "Publicis Sapient",
    location: "Bangalore / Gurugram",
    timePosted: "a day ago",
    jobFunctions: ["Software Development", "Engineering"],
    salary: "Not Disclosed",
    description: [
      "Work on cutting-edge technologies and real-world projects.",
      "Collaborate with cross-functional teams.",
      "Learn and implement best practices in software development.",
    ],
    status: "Yet to apply",
    jobType: "Internship",            // Added job type
    degreesEligible: ["B.Tech"],
    branchesEligible: ["CSE", "ECE", "IT"],
    batchesEligible: [2024, 2025],   // Updated to allow multiple batches
    cgpaCutoff: 8.0,
  },
  {
    id: "happequity",
    title: "Associate Management Trainee",
    company: "Happequity Investment",
    location: "New Delhi / Hybrid",
    timePosted: "a month ago",
    jobFunctions: ["Business Operations", "Management"],
    salary: "As per industry standards",
    description: [
      "Learn about investment strategies and portfolio management.",
      "Assist in market research and analysis.",
      "Support senior management in decision-making.",
    ],
    status: "Applications closed",
    jobType: "Placement",            // Added job type
    degreesEligible: ["MBA", "BBA"],
    branchesEligible: ["Any"],
    batchesEligible: [2022, 2023, 2024], // Updated to allow multiple batches
    cgpaCutoff: 7.0,
  },
]

export default function JobListings() {
  const [activeJobId, setActiveJobId] = useState<string | null>(jobs.length > 0 ? jobs[0].id : null)
  const [activeTab, setActiveTab] = useState<{ [key: string]: "description" | "eligibility" }>({})

  const handleTabClick = (jobId: string, tab: "description" | "eligibility") => {
    setActiveTab((prev) => ({ ...prev, [jobId]: tab }))
  }

  const handleJobClick = (jobId: string) => {
    setActiveJobId(jobId)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Job List */}
      <div className="w-1/4 bg-white p-4 border-r border-gray-300">
        <h2 className="text-xl font-semibold mb-4">All Jobs</h2>
        <ul className="space-y-2">
          {jobs.map((job) => (
            <li
              key={job.id}
              className={`p-2 rounded-md cursor-pointer hover:bg-gray-200 ${activeJobId === job.id ? "bg-gray-200" : ""
                }`}
              onClick={() => handleJobClick(job.id)}
            >
              <h3 className="font-semibold text-left">{job.company}</h3>
              <p className="text-sm text-gray-500 text-left">
                {job.title} • {job.location} • {job.jobType}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Job Details */}
      <div className="w-3/4 p-4">
        {activeJobId && (
          <JobDetails
            job={jobs.find((job) => job.id === activeJobId)!}
            activeTab={activeTab[activeJobId]}
            handleTabClick={(tab) => handleTabClick(activeJobId, tab)}
          />
        )}
      </div>
    </div>
  )
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
        <div>
          <h2 className="text-gray-700">{job.title}</h2>
          <p className="text-2xl font-semibold">
            {job.company}
          </p>
          <p className="text-gray-500">
            {job.location} • {job.jobType}
          </p>

        </div>
        <Badge variant={job.status === "Not Selected"
          ? "destructive"
          : job.status === "Yet to apply"
            ? "warning"
            : "secondary"}
          className="mt-1"
        >
          {job.status}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex border-b text-gray-500">
        <button
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${activeTab === "description"
            ? "border-b-2 border-blue-500 text-blue-500 font-bold"
            : "hover:text-gray-700"
            }`}
          onClick={() => handleTabClick("description")}
        >
          Job Description
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium focus:outline-none ${activeTab === "eligibility"
            ? "border-b-2 border-blue-500 text-blue-500 font-bold"
            : "hover:text-gray-700"
            }`}
          onClick={() => handleTabClick("eligibility")}
        >
          Eligibility Criteria
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '300px' }}>
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
