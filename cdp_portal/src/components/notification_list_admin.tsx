"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, CalendarDays } from "lucide-react"
import { Notification } from "@/lib/api/notification"
import { useNotificationApi } from "@/lib/api/notification"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface NotificationListAdminProps {
  notifications: Notification[]
  loading: boolean
  onNotificationChange: () => void
}

export function NotificationListAdmin({ notifications, loading, onNotificationChange }: NotificationListAdminProps) {
  const { updateNotification, deleteNotification } = useNotificationApi()
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [editForm, setEditForm] = useState<{
    title: string
    message: string
    type: Notification["type"]
  }>({
    title: "",
    message: "",
    type: "info",
  })

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification)
    setEditForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
    })
  }

  const handleUpdate = async () => {
    if (!editingNotification?._id) return

    try {
      await updateNotification(editingNotification._id, editForm)
      setEditingNotification(null)
      onNotificationChange()
    } catch (error) {
      console.error("Error updating notification:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      onNotificationChange()
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

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
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {notification.created_at && new Date(notification.created_at).toLocaleDateString()}
              </div>
              {notification.updated_at && notification.created_at && 
               notification.updated_at !== notification.created_at && (
                <div className="text-xs text-muted-foreground">
                  (Updated: {new Date(notification.updated_at).toLocaleDateString()})
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(notification)}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Notification</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <Textarea
                        value={editForm.message}
                        onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select
                        value={editForm.type}
                        onValueChange={(value: Notification["type"]) => setEditForm({ ...editForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingNotification(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdate}>Save Changes</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500"
                onClick={() => notification._id && handleDelete(notification._id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

