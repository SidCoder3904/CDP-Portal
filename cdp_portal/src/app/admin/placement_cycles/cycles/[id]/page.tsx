import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Download,
  Users,
  Briefcase,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { JobsList } from "@/components/jobs-list";
import { StudentsList } from "@/components/students-list";
import { CycleStats } from "@/components/cycle-stats";

export default function CyclePage({ params }: { params: { id: string } }) {
  // Mock data - in a real app, this would be fetched from an API
  const cycles = [
    {
      id: "1",
      name: "Placement Cycle 2025",
      type: "Placement",
      startDate: "Aug 1, 2024",
      endDate: "Apr 30, 2025",
      status: "Active",
      description: "Main placement cycle for 2025 graduating batch",
      eligibleBranches: [
        "Computer Science",
        "Electronics",
        "Electrical",
        "Mechanical",
      ],
      eligiblePrograms: ["B.Tech", "M.Tech", "MCA"],
      coordinators: ["Dr. John Smith", "Prof. Jane Doe"],
    },
    {
      id: "2",
      name: "Internship Cycle 2024",
      type: "Internship",
      startDate: "Sep 15, 2023",
      endDate: "Dec 31, 2023",
      status: "Active",
      description: "Internship opportunities for pre-final year students",
      eligibleBranches: ["Computer Science", "Electronics", "Electrical"],
      eligiblePrograms: ["B.Tech"],
      coordinators: ["Dr. Robert Johnson", "Prof. Emily Williams"],
    },
  ];

  const cycle = cycles.find((c) => c.id === params.id);

  if (!cycle) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold tracking-tight">Cycle not found</h1>
        <p className="text-muted-foreground">
          The requested cycle does not exist.
        </p>
        <Link
          href="/admin/placement_cycles/cycles"
          className="mt-4 inline-block"
        >
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cycles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/placement_cycles/cycles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{cycle.name}</h1>
          <p className="text-muted-foreground">{cycle.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Badge className="text-sm py-1">
          <Calendar className="mr-1 h-4 w-4" />
          {cycle.startDate} - {cycle.endDate}
        </Badge>
        <Badge
          variant={cycle.status === "Active" ? "default" : "outline"}
          className="text-sm py-1"
        >
          {cycle.status}
        </Badge>
        <Badge variant="secondary" className="text-sm py-1">
          {cycle.type}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Eligible Branches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cycle.eligibleBranches.map((branch) => (
                <Badge key={branch} variant="outline">
                  {branch}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Eligible Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cycle.eligiblePrograms.map((program) => (
                <Badge key={program} variant="outline">
                  {program}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Coordinators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {cycle.coordinators.map((coordinator) => (
                <p key={coordinator} className="text-sm">
                  {coordinator}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CycleStats cycleId={params.id} />

      <Tabs defaultValue="jobs" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="jobs" className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Students
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Link href={`/admin/placement_cycles/cycles/${params.id}/jobs/new`}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Job
              </Button>
            </Link>
          </div>
        </div>
        <TabsContent value="jobs" className="mt-0">
          <JobsList cycleId={params.id} />
        </TabsContent>
        <TabsContent value="students" className="mt-0">
          <StudentsList cycleId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
