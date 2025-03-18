"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Building2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notice {
  _id: string  // Changed from `id` to match backend
  title: string
  content: string
  created_by: string
  created_at: string
  updated_at: string
}

export function NoticeList() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        
        console.log(`Fetching notices from: ${backendUrl}/api/notices/`)
        
        const response = await axios.get(`${backendUrl}/api/notices/`, {
          withCredentials: true,
        })
        
        console.log("Notices response:", response.data)
        
        if (response.data.notices) {
          setNotices(response.data.notices.map((notice: any) => ({
            ...notice,
            _id: notice._id || notice.id, // Ensure consistency
            created_by: String(notice.created_by), // Convert to string if needed
          })))
        } else {
          console.error("Unexpected response format:", response.data)
          setError("Unexpected response format from server")
        }
      } catch (err) {
        console.error("Error fetching notices:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch notices")
      } finally {
        setLoading(false)
      }
    }
    
    fetchNotices()
  }, [])
  
  if (loading) {
    return <div className="text-center py-8">Loading notices...</div>
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }
  
  if (notices.length === 0) {
    return <div className="text-center py-8">No notices available</div>
  }
  
  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <Card key={notice._id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold text-template">{notice.title}</CardTitle>
              <Badge variant="secondary">Notice</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{notice.content}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {/* Handle potential date format issues */}
                {(() => {
                  try {
                    return formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })
                  } catch (e) {
                    console.error("Invalid date format:", notice.created_at)
                    return "Invalid date"
                  }
                })()}
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                Posted by: {notice.created_by}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
