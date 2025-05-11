import { useApi } from "@/lib/api"

export interface Notification {
  _id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  placement_cycle_id: string
  created_at: string
  updated_at: string
  created_by: string
}

export interface PlacementCycle {
  id: string
  name: string
  type: string
  startDate: string
  endDate: string
  status: string
  jobs: number
  students: number
}

export function useNotificationApi() {
  const { fetchWithAuth } = useApi()

  const getPlacementCycles = async (): Promise<PlacementCycle[]> => {
    console.log('Fetching placement cycles...')
    try {
      // Using direct API endpoint without auth
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/placement-cycles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('Placement cycles response status:', response.status)
      
      if (!response.ok) {
        const error = await response.json()
        console.error('Error fetching placement cycles:', error)
        throw new Error(error.message || "Failed to fetch placement cycles")
      }
      
      const data = await response.json()
      console.log('Placement cycles data:', data)
      return data
    } catch (error) {
      console.error('Exception in getPlacementCycles:', error)
      throw error
    }
  }

  const getPlacementCycleById = async (cycleId: string): Promise<PlacementCycle> => {
    console.log('Fetching placement cycle by ID:', cycleId)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/placement-cycles/${cycleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('Placement cycle response status:', response.status)
      
      if (!response.ok) {
        const error = await response.json()
        console.error('Error fetching placement cycle:', error)
        throw new Error(error.message || "Failed to fetch placement cycle")
      }
      
      const data = await response.json()
      console.log('Placement cycle data:', data)
      return data
    } catch (error) {
      console.error('Exception in getPlacementCycleById:', error)
      throw error
    }
  }

  const getNotifications = async (placementCycleId: string): Promise<Notification[]> => {
    const response = await fetchWithAuth(`/api/notifications/${placementCycleId}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch notifications")
    }
    return response.json()
  }

  const createNotification = async (data: Omit<Notification, "_id" | "created_at" | "updated_at">): Promise<Notification> => {
    const response = await fetchWithAuth('/api/admin/notifications', {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
      throw new Error(error.message || "Failed to create notification")
      }
      
    return response.json()
  }

  const updateNotification = async (notificationId: string, data: Partial<Notification>): Promise<Notification> => {
    const response = await fetchWithAuth(`/api/admin/notifications/${notificationId}`, {
      method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
      throw new Error(error.message || "Failed to update notification")
      }

    return response.json()
  }

  const deleteNotification = async (notificationId: string): Promise<void> => {
    const response = await fetchWithAuth(`/api/admin/notifications/${notificationId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete notification")
    }
  }

  const markAsRead = async (notificationId: string): Promise<Notification> => {
    console.log('Marking notification as read:', notificationId)
    try {
      const response = await fetchWithAuth(`/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_read: true,
          updated_at: new Date(),
        }),
      })
      console.log('Mark as read response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('Error marking notification as read:', error)
        throw new Error(error.message || "Failed to mark notification as read")
      }

      const data = await response.json()
      console.log('Marked notification as read:', data)
      return data
    } catch (error) {
      console.error('Exception in markAsRead:', error)
      throw error
    }
  }

  const markAllAsRead = async (placementCycleId: string): Promise<void> => {
    console.log('Marking all notifications as read for cycle:', placementCycleId)
    try {
      const response = await fetchWithAuth(`/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placement_cycle_id: placementCycleId,
          updated_at: new Date(),
        }),
      })
      console.log('Mark all as read response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('Error marking all notifications as read:', error)
        throw new Error(error.message || "Failed to mark all notifications as read")
      }
      
      console.log('Successfully marked all notifications as read')
    } catch (error) {
      console.error('Exception in markAllAsRead:', error)
      throw error
    }
  }

  return {
    getPlacementCycles,
    getPlacementCycleById,
    getNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
  }
} 