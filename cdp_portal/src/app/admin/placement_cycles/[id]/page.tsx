"use client";

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
  Loader2,
} from "lucide-react";
import { JobsList } from "@/components/jobs-list";
import { StudentsList } from "@/components/students-list";
import { CycleStats } from "@/components/cycle-stats";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/api";
import React from "react";

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
  eligiblePrograms?: string[];
  jobs?: number;
  students?: number;
}

// Component to fetch and display cycle data
function CycleDetail({ id }: { id: string }) {
  const { fetchWithAuth } = useApi();
  const [cycle, setCycle] = useState<CycleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCycleData = async () => {
      setIsLoading(true);
      try {
        // Use fetchWithAuth instead of direct fetch
        const response = await fetchWithAuth(`/api/placement-cycles/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Cycle not found");
          }
          throw new Error(`Failed to fetch cycle: ${response.status}`);
        }

        const cycleData: CycleData = await response.json();

        // Ensure optional fields have default values if not provided by API
        cycleData.description =
          cycleData.description || "No description available";
        cycleData.eligiblePrograms = cycleData.eligiblePrograms || [];

        setCycle(cycleData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCycleData();
  }, [id]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center text-red-500 gap-2 mb-4">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-bold">Error Loading Cycle</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          There was an error loading the cycle data: {error.message}
        </p>
        <Link href="/admin/placement_cycles" className="inline-block">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cycles
          </Button>
        </Link>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold tracking-tight">Cycle not found</h1>
        <p className="text-muted-foreground">
          The requested cycle does not exist.
        </p>
        <Link href="/admin/placement_cycles" className="mt-4 inline-block">
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
        <Link href="/admin/placement_cycles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-template">
            {cycle.name}
          </h1>
          <p className="text-muted-foreground">{cycle.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Badge className="text-sm py-1 bg-template">
          <Calendar className="mr-1 h-4 w-4" />
          {new Date(cycle.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          -{" "}
          {new Date(cycle.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
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
              Eligible Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {cycle.eligiblePrograms && cycle.eligiblePrograms.length > 0 ? (
                cycle.eligiblePrograms.map((program) => (
                  <Badge key={program} variant="outline">
                    {program}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No programs specified
                </p>
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
            <Link href={`/admin/placement_cycles/${id}/jobs/new`}>
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
}

export default function CyclePage() {
  const params = useParams();
  const id = params?.id as string;

  if (!id) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center text-red-500 gap-2 mb-4">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-bold">Missing Cycle ID</h1>
        </div>
        <Link href="/admin/placement_cycles" className="inline-block">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cycles
          </Button>
        </Link>
      </div>
    );
  }

  return <CycleDetail id={id} />;
}
