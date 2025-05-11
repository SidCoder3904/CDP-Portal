import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard-stats";
import { RecentActivity } from "@/components/recent-activity";
import { PlusCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="container m-10 py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Placement and Internship Management Portal
          </p>
        </div>
        <Link href="/admin/placement_cycles/cycles/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Cycle
          </Button>
        </Link>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Placement Cycles</CardTitle>
            <CardDescription>
              Currently active placement and internship cycles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  name: "Placement Cycle 2025",
                  status: "Active",
                  jobs: 12,
                  students: 450,
                },
                {
                  id: 2,
                  name: "Internship Cycle 2024",
                  status: "Active",
                  jobs: 8,
                  students: 320,
                },
              ].map((cycle) => (
                <Link
                  href={`/admin/placement_cycles/cycles/${cycle.id}`}
                  key={cycle.id}
                >
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <h3 className="font-medium">{cycle.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cycle.jobs} jobs • {cycle.students} students
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {cycle.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/admin/placement_cycles/cycles">
              <Button variant="outline">View All Cycles</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from placement activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
          <CardFooter>
            <Link href="/admin/placement_cycles/activity">
              <Button variant="outline">View All Activity</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
