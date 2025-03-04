"use client";
import { useState } from "react";
import JobList from "@/components/company_list";
import JobDetails from "@/components/job_details";

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

const jobs: JobListing[] = [
  {
    id: "samsung-rd",
    logo: "https://tse1.mm.bing.net/th?id=OIP.3DbB0C3-LsGSt-xtIonLLQHaEK&pid=Api&P=0&h=180",
    title: "R&D Intern",
    company: "Samsung Research Institute Noida",
    location: "Noida",
    timePosted: "a day ago",
    jobFunctions: [
      "Engineering - Web / Software",
      "Information Technology",
      "Research",
    ],
    salary: "₹50000 per Month",
    description: [
      "Standardize the software development process to meet the delivery, quality and cost of software.",
      "Monitor quality of software development outcomes and continue to improve the process.",
      "Understand and apply software process within the organization.",
      "Understand different development methodologies and apply to projects.",
      "Participate in process tailoring, review and inspection activities of software development tasks.",
    ],
    status: "Not Selected",
    jobType: "Internship", // Added job type
    degreesEligible: ["B.Tech", "M.Tech", "PhD"],
    branchesEligible: ["CSE", "ECE", "IT"],
    batchesEligible: [2023, 2024], // Updated to allow multiple batches
    cgpaCutoff: 7.5,
  },
  {
    id: "publicis",
    logo: "https://logos-world.net/wp-content/uploads/2020/09/Google-Symbol.png",
    title: "Intern Engineering",
    company: "Google",
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
    jobType: "Internship", // Added job type
    degreesEligible: ["B.Tech"],
    branchesEligible: ["CSE", "ECE", "IT"],
    batchesEligible: [2024, 2025], // Updated to allow multiple batches
    cgpaCutoff: 8.0,
  },
  {
    id: "happequity",
    logo: "https://tse3.mm.bing.net/th?id=OIP.MZ4UQDt3m9QSx8207WIUxgHaGu&pid=Api&P=0&h=180",
    title: "Associate Management Trainee",
    company: "Amazon",
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
    jobType: "Placement", // Added job type
    degreesEligible: ["MBA", "BBA"],
    branchesEligible: ["Any"],
    batchesEligible: [2022, 2023, 2024], // Updated to allow multiple batches
    cgpaCutoff: 7.0,
  },
];

export default function JobListings() {
  const [activeJobId, setActiveJobId] = useState<string | null>(
    jobs.length > 0 ? jobs[0].id : null
  );
  const [activeTab, setActiveTab] = useState<{
    [key: string]: "description" | "eligibility";
  }>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleTabClick = (
    jobId: string,
    tab: "description" | "eligibility"
  ) => {
    setActiveTab((prev) => ({ ...prev, [jobId]: tab }));
  };

  const handleJobClick = (jobId: string) => {
    setActiveJobId(jobId);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Job List */}
      <JobList
        jobs={jobs}
        activeJobId={activeJobId}
        onJobClick={handleJobClick}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Job Details */}
      <div
        className="w-3/4 p-4 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        {activeJobId && (
          <JobDetails
            job={jobs.find((job) => job.id === activeJobId)!}
            activeTab={activeTab[activeJobId]}
            handleTabClick={(tab) => handleTabClick(activeJobId, tab)}
          />
        )}
      </div>
    </div>
  );
}
