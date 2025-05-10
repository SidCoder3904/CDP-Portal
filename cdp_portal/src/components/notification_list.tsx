import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Building2, GraduationCap } from "lucide-react"
import { Notification } from "@/lib/api/notification"

interface NotificationListProps {
  notifications: Notification[]
  loading: boolean
}

export function NotificationList({ notifications, loading }: NotificationListProps) {
  if (loading) {
    return <div>Loading notifications...</div>
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification._id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold text-template">{notification.title}</CardTitle>
              <Badge variant="secondary">{notification.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{notification.message}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {new Date(notification.created_at || "").toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

