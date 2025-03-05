import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Building, Award } from "lucide-react"

interface CycleStatsProps {
  cycleId: string
}

export function CycleStats({ cycleId }: CycleStatsProps) {
  // Mock data - in a real app, this would be fetched based on the cycleId
  const stats = {
    totalJobs: 12,
    activeJobs: 8,
    totalStudents: 450,
    registeredStudents: 425,
    totalCompanies: 10,
    totalPlacements: 120,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalJobs}</div>
          <p className="text-xs text-muted-foreground">{stats.activeJobs} currently active</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            {stats.registeredStudents} registered ({Math.round((stats.registeredStudents / stats.totalStudents) * 100)}
            %)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Companies</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCompanies}</div>
          <p className="text-xs text-muted-foreground">Participating in this cycle</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Placements</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPlacements}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.totalPlacements / stats.totalStudents) * 100)}% placement rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

