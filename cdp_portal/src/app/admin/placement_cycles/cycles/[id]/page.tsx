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
  AlertCircle,
} from "lucide-react";
import { JobsList } from "@/components/jobs-list";
import { StudentsList } from "@/components/students-list";
import { CycleStats } from "@/components/cycle-stats";
import { Suspense } from "react";

// Loading component
function LoadingState() {
  return (
    <div className="container mx-auto py-6 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
      <p className="mt-2 text-muted-foreground">Loading cycle details...</p>
    </div>
  );
}

// Interface for cycle data
interface CycleData {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
  eligibleBranches?: string[];
  eligiblePrograms?: string[];
  coordinators?: string[];
  jobs?: number;
  students?: number;
}

// Component to fetch and display cycle data
async function CycleDetail({ id }: { id: string }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  
  try {
    const response = await fetch(`${backendUrl}/api/placement-cycles/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return (
          <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight">Cycle not found</h1>
            <p className="text-muted-foreground">
              The requested cycle does not exist.
            </p>
            <Link href="/admin/placement_cycles/cycles" className="mt-4 inline-block">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cycles
              </Button>
            </Link>
          </div>
        );
      }
      throw new Error(`Failed to fetch cycle: ${response.status}`);
    }
    
    const cycle: CycleData = await response.json();
    
    // Ensure optional fields have default values if not provided by API
    cycle.description = cycle.description || "No description available";
    cycle.eligibleBranches = cycle.eligibleBranches || [];
    cycle.eligiblePrograms = cycle.eligiblePrograms || [];
    cycle.coordinators = cycle.coordinators || [];
    
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
                {cycle.eligibleBranches.length > 0 ? (
                  cycle.eligibleBranches.map((branch) => (
                    <Badge key={branch} variant="outline">
                      {branch}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No branches specified</p>
                )}
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
                {cycle.eligiblePrograms.length > 0 ? (
                  cycle.eligiblePrograms.map((program) => (
                    <Badge key={program} variant="outline">
                      {program}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No programs specified</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Coordinators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {cycle.coordinators.length > 0 ? (
                  cycle.coordinators.map((coordinator) => (
                    <p key={coordinator} className="text-sm">
                      {coordinator}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No coordinators assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <CycleStats cycleId={id} />

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
              <Link href={`/admin/placement_cycles/cycles/${id}/jobs/new`}>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Job
                </Button>
              </Link>
            </div>
          </div>
          <TabsContent value="jobs" className="mt-0">
            <JobsList cycleId={id} />
          </TabsContent>
          <TabsContent value="students" className="mt-0">
            <StudentsList cycleId={id} />
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center text-red-500 gap-2 mb-4">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-bold">Error Loading Cycle</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          There was an error loading the cycle data: {(error as Error).message}
        </p>
        <Link href="/admin/placement_cycles/cycles" className="inline-block">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cycles
          </Button>
        </Link>
      </div>
    );
  }
}

export default function CyclePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <CycleDetail id={params.id} />
    </Suspense>
  );
}
