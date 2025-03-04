"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Users, Briefcase, Building, GraduationCap } from "lucide-react"
// import { JobFloatButton } from "./job-float-button"

interface PlacementCycle {
  id: number
  name: string
  year: string
  type: "Internship" | "Placement"
  status: "Active" | "Completed" | "Upcoming"
  studentsParticipating: number
  companiesParticipating: number
  startDate: string
  endDate: string
  eligibleBranches: string[]
}

interface Job {
  id: number
  company: string
  role: string
  studentsApplied: number
  status: "Open" | "Closed" | "In Progress"
}

export default function PlacementCycleDetails() {
  const params = useParams()
  const [cycle, setCycle] = useState<PlacementCycle | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    // Fetch cycle details
    setCycle({
      id: 1,
      name: "Summer Internship",
      year: "2024",
      type: "Internship",
      status: "Active",
      studentsParticipating: 250,
      companiesParticipating: 50,
      startDate: "2024-05-01",
      endDate: "2024-07-31",
      eligibleBranches: ["Computer Science", "Electrical Engineering", "Mechanical Engineering"],
    })

    // Fetch jobs
    setJobs([
      { id: 1, company: "Google", role: "Software Engineer Intern", studentsApplied: 75, status: "Open" },
      { id: 2, company: "Samsung", role: "Data Science Intern", studentsApplied: 50, status: "In Progress" },
      { id: 3, company: "Amazon", role: "Product Management Intern", studentsApplied: 40, status: "Closed" },
    ])
  }, [])

  if (!cycle) return <div>Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-template">
          {cycle.name} {cycle.year}
        </h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cycle Overview</CardTitle>
            <Badge
              variant={cycle.status === "Active" ? "default" : cycle.status === "Completed" ? "secondary" : "outline"}
            >
              {cycle.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <CalendarDays className="h-8 w-8 text-template mb-2" />
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="font-medium">
                {cycle.startDate} - {cycle.endDate}
              </span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-template mb-2" />
              <span className="text-sm text-muted-foreground">Students</span>
              <span className="font-medium">{cycle.studentsParticipating}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <Briefcase className="h-8 w-8 text-template mb-2" />
              <span className="text-sm text-muted-foreground">Companies</span>
              <span className="font-medium">{cycle.companiesParticipating}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <GraduationCap className="h-8 w-8 text-template mb-2" />
              <span className="text-sm text-muted-foreground">Eligible Branches</span>
              <span className="font-medium">{cycle.eligibleBranches.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs">
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold">{job.role}</h3>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{job.studentsApplied} applied</span>
                    <Badge
                      variant={job.status === "Open" ? "default" : job.status === "Closed" ? "secondary" : "outline"}
                    >
                      {job.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="students">
          {/* Add student list or statistics here */}
          <p>Student information and statistics will be displayed here.</p>
        </TabsContent>
        <TabsContent value="statistics">
          {/* Add placement cycle statistics here */}
          <p>Detailed statistics about the placement cycle will be shown here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}

