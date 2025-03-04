import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Building2, GraduationCap } from "lucide-react"

export function NoticeList() {
  const notices = [
    {
      id: 1,
      title: "Campus Recruitment Drive - Tech Giants 2024",
      date: "February 15, 2024",
      company: "Multiple Companies",
      type: "Placement",
      content:
        "Registration open for final year B.Tech/M.Tech students for the upcoming campus recruitment drive. Top tech companies will be participating.",
    },
    {
      id: 2,
      title: "Summer Internship Opportunities",
      date: "February 14, 2024",
      company: "Various Organizations",
      type: "Internship",
      content:
        "Pre-final year students can now apply for summer internships. Multiple positions available across different domains.",
    },
    {
      id: 3,
      title: "Resume Building Workshop",
      date: "February 13, 2024",
      company: "Career Development Cell",
      type: "Workshop",
      content:
        "Mandatory workshop for all final year students. Learn how to create an impactful resume from industry experts.",
    },
  ]

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <Card key={notice.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold text-template">{notice.title}</CardTitle>
              <Badge variant="secondary">{notice.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{notice.content}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {notice.date}
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {notice.company}
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                For: {notice.type === "Internship" ? "Pre-final Year" : "Final Year"}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

