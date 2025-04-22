"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Building } from "lucide-react"

export interface PlacementCycle {
  _id: string
  title: string
  description: string
  year: string
  type: "Placement" | "Internship" | "Both"
  startDate: string
  endDate: string
  companies: string[]
  enrolledStudents?: string[]
}

interface PlacementCycleCardProps {
  cycle: PlacementCycle
  isAdmin?: boolean
  isEnrolled?: boolean
  onClick: () => void
  onDelete?: (id: string) => void
  onEnroll?: (id: string) => void
}

export function PlacementCycleCard({
  cycle,
  isAdmin = false,
  isEnrolled = false,
  onClick,
  onDelete,
  onEnroll,
}: PlacementCycleCardProps) {
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${isEnrolled ? "border-l-4 border-l-template" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-template">{cycle.title}</h3>
          <Badge variant="secondary">{cycle.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">{cycle.description}</p>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {cycle.startDate} - {cycle.endDate}
          </div>
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            {cycle.companies.length} {cycle.companies.length === 1 ? "company" : "companies"}
          </div>
          {cycle.enrolledStudents && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {cycle.enrolledStudents.length} students
            </div>
          )}
        </div>
      </CardContent>
      {(isAdmin || !isEnrolled) && (
        <CardFooter className="pt-0">
          <div className="flex justify-end gap-2 w-full">
            {isAdmin ? (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete && onDelete(cycle._id)
                }}
              >
                Delete
              </Button>
            ) : !isEnrolled ? (
              <Button
                className="bg-template hover:bg-[#003167]"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEnroll && onEnroll(cycle._id)
                }}
              >
                Enroll
              </Button>
            ) : null}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
