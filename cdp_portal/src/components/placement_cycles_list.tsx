"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Briefcase, ArrowRight } from "lucide-react"
import Link from "next/link"

interface PlacementCycle {
  id: number
  name: string
  year: string
  type: "Internship" | "Placement"
  status: "Active" | "Completed" | "Upcoming"
  studentsParticipating: number
  companiesParticipating: number
}

export function PlacementCyclesList() {
  const [cycles, setCycles] = useState<PlacementCycle[]>([
    {
      id: 1,
      name: "Summer Internship",
      year: "2024",
      type: "Internship",
      status: "Active",
      studentsParticipating: 250,
      companiesParticipating: 50,
    },
    {
      id: 2,
      name: "Full-time Placements",
      year: "2024",
      type: "Placement",
      status: "Upcoming",
      studentsParticipating: 300,
      companiesParticipating: 75,
    },
    {
      id: 3,
      name: "Winter Internship",
      year: "2023",
      type: "Internship",
      status: "Completed",
      studentsParticipating: 200,
      companiesParticipating: 40,
    },
  ])

  return (
    <div className="space-y-4">
      {cycles.map((cycle) => (
        <Card key={cycle.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold text-[#002147]">
                {cycle.name} {cycle.year}
              </CardTitle>
              <Badge
                variant={cycle.status === "Active" ? "default" : cycle.status === "Completed" ? "secondary" : "outline"}
              >
                {cycle.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {cycle.year}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {cycle.studentsParticipating} Students
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {cycle.companiesParticipating} Companies
              </div>
            </div>
            <div className="flex justify-end">
              <Button asChild variant="outline">
                <Link href={`/admin/placement-cycles/${cycle.id}`}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

