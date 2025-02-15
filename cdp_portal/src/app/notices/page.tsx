import { Download, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Notice {
  title: string
  link: string
  type: "pdf" | "view"
  date: string
}

export default function NoticeList() {
  const notices: Notice[] = [
    {
      title: "Academic Calendar February 2025 to July 2025 for B.Sc-B.Ed 2024 batch",
      link: "#",
      type: "view",
      date: "2025-02-01",
    },
    {
      title: "Academic Calendar 2nd semester of AY 2024-25 and 1st semester of AY 2025-26",
      link: "#",
      type: "view",
      date: "2024-12-15",
    },
    {
      title: "Academic Calendar September 2024 to January 2025 for B.Sc-B.Ed 2024 batch",
      link: "#",
      type: "pdf",
      date: "2024-09-01",
    },
    // Add more notices as needed
  ]

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        Notices
      </h1>

      <div className="grid gap-4">
        {notices.map((notice, index) => (
          <Card key={index} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{notice.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {new Date(notice.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Badge>
                    <Badge variant={notice.type === "pdf" ? "destructive" : "default"} className="text-xs">
                      {notice.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download {notice.title}</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

