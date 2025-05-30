"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Loader2,
} from "lucide-react";
import { JobApplicants } from "@/components/job-applicants";
import { JobDetails } from "@/components/job-details";
import { JobWorkflow } from "@/components/job-workflow";
import { useEffect, useState } from "react";
import { useJobsApi } from "@/lib/api/jobs";

// Define the props type with params structure
interface JobPageProps {
  params: {
    id: string;
    jobId: string;
  };
}

// Use the single page function pattern recommended by Next.js
export default function JobPage({ params }: JobPageProps) {
  // Instead of destructuring immediately, access properties when needed
  const cycleId = params.id;
  const jobId = params.jobId;

  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const jobsApi = useJobsApi();

  // Check if deadline has passed
  const isDeadlinePassed = (deadline: string): boolean => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    // Reset time part for accurate date comparison
    today.setHours(0, 0, 0, 0);
    return deadlineDate < today;
  };

  // Format the deadline for display
  const formatDeadline = (deadline: string): string => {
    if (!deadline) return "No deadline";
    return new Date(deadline).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const jobData = await jobsApi.getJobById(jobId);
        setJob(jobData);
        console.log(jobData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading job details...</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold tracking-tight">Job not found</h1>
        <p className="text-muted-foreground">
          The requested job does not exist.
        </p>
        <Link href={`/admin/placement_cycles/${cycleId}`}>
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cycle
          </Button>
        </Link>
      </div>
    );
  }

  // Determine if deadline has passed
  const deadlinePassed = isDeadlinePassed(job.deadline);
  // Set display status based on deadline
  const displayStatus = deadlinePassed ? "closed" : job.status;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/admin/placement_cycles/${cycleId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-template">
            {job.role}
          </h1>
          <p className="text-muted-foreground">
            {job.company} • {job.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Package</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{job.package}</div>
            <p className="text-xs text-muted-foreground">Annual compensation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deadline</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDeadline(job.deadline)}
            </div>
            <p className="text-xs text-muted-foreground">
              Application closing date
              {deadlinePassed && <span className="text-red-500 ml-1"></span>}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Badge className="text-sm py-1 bg-template">
          <MapPin className="mr-1 h-4 w-4" />
          {job.location}
        </Badge>
        <Badge
          variant={displayStatus === "open" ? "default" : "secondary"}
          className="text-sm py-1 bg-template"
        >
          {deadlinePassed
            ? "Closed"
            : displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="workflow">Hiring Workflow</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="details" className="mt-0">
          <JobDetails job={job} />
        </TabsContent>
        <TabsContent value="workflow" className="mt-0">
          <JobWorkflow steps={job.hiringFlow} />
        </TabsContent>
        <TabsContent value="applicants" className="mt-0">
          <JobApplicants jobId={jobId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
