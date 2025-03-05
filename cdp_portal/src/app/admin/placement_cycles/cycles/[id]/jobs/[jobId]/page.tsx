import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Users, Clock, MapPin, DollarSign } from "lucide-react"
import { JobApplicants } from "@/components/job-applicants"
import { JobDetails } from "@/components/job-details"
import { JobWorkflow } from "@/components/job-workflow"

export default function JobPage({ params }: { params: { id: string; jobId: string } }) {
  // Mock data - in a real app, this would be fetched from an API
  const jobs = [
    {
      id: "1",
      company: "Google",
      role: "Software Engineer",
      package: "₹25 LPA",
      location: "Bangalore",
      deadline: "Oct 15, 2023",
      status: "Open",
      description:
        "Google is looking for Software Engineers to develop next-generation products and technologies. As a Software Engineer at Google, you'll work on a specific project critical to Google's needs with opportunities to switch teams and projects as you and our fast-paced business grow and evolve.",
      requirements: [
        "Bachelor's degree in Computer Science, related technical field, or equivalent practical experience",
        "Experience in software development in one or more general-purpose programming languages",
        "Experience working with data structures or algorithms",
        "Strong problem-solving skills",
      ],
      eligibleBranches: ["Computer Science", "Electronics"],
      eligiblePrograms: ["B.Tech", "M.Tech", "MCA"],
      minCGPA: 8.0,
      workflowSteps: [
        { id: 1, name: "Resume Shortlisting", description: "Initial screening of resumes" },
        { id: 2, name: "Online Assessment", description: "Technical assessment" },
        { id: 3, name: "Technical Interview", description: "Technical skills evaluation" },
        { id: 4, name: "HR Interview", description: "Cultural fit and HR round" },
      ],
      applicants: 120,
      selected: 0,
      rejected: 25,
      inProgress: 95,
    },
  ]

  const job = jobs.find((j) => j.id === params.jobId)

  if (!job) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold tracking-tight">Job not found</h1>
        <p className="text-muted-foreground">The requested job does not exist.</p>
        <Link href={`/admin/placement_cycles/cycles/${params.id}`} className="mt-4 inline-block">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cycle
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/admin/placement_cycles/cycles/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{job.role}</h1>
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
            <div className="text-2xl font-bold">{job.deadline}</div>
            <p className="text-xs text-muted-foreground">Application closing date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{job.applicants}</div>
            <p className="text-xs text-muted-foreground">Total registered students</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Badge className="text-sm py-1">
          <MapPin className="mr-1 h-4 w-4" />
          {job.location}
        </Badge>
        <Badge variant={job.status === "Open" ? "default" : "outline"} className="text-sm py-1">
          {job.status}
        </Badge>
        <Badge variant="secondary" className="text-sm py-1">
          Min CGPA: {job.minCGPA}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="workflow">Hiring Workflow</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Applicants
            </Button>
          </div>
        </div>
        <TabsContent value="details" className="mt-0">
          <JobDetails job={job} />
        </TabsContent>
        <TabsContent value="workflow" className="mt-0">
          <JobWorkflow steps={job.workflowSteps} />
        </TabsContent>
        <TabsContent value="applicants" className="mt-0">
          <JobApplicants jobId={params.jobId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

