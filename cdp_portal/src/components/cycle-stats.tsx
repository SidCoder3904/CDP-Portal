import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building } from "lucide-react"
import { useEffect, useState } from "react"
import { useApi } from "@/lib/api"

interface CycleStatsProps {
  cycleId: string
}

export function CycleStats({ cycleId }: CycleStatsProps) {
  const { fetchWithAuth } = useApi()
  const [stats, setStats] = useState({
    totalStudents: 0,
    registeredStudents: 0,
    totalCompanies: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        // Fetch jobs to count companies
        const jobsResponse = await fetchWithAuth(`/api/placement-cycles/${cycleId}/jobs`)
        
        // Fetch students
        const studentsResponse = await fetchWithAuth(`/api/placement-cycles/${cycleId}/students`)
        
        if (jobsResponse.ok && studentsResponse.ok) {
          const jobs = await jobsResponse.json()
          const students = await studentsResponse.json()
          
          // Extract unique companies from jobs
          const uniqueCompanies = new Set(jobs.map((job: any) => job.company))
          
          // Count registered students
          const registered = students.filter((student: any) => 
            student.status === "Registered" || student.status === "Placed"
          ).length
          
          setStats({
            totalStudents: students.length,
            registeredStudents: registered,
            totalCompanies: uniqueCompanies.size,
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [cycleId])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.registeredStudents} registered ({stats.totalStudents > 0 
                  ? Math.round((stats.registeredStudents / stats.totalStudents) * 100) 
                  : 0}%)
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Companies</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">Participating in this cycle</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

