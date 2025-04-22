import { useApi } from "@/lib/api"

export interface Notice {
  _id?: string
  title: string
  date: string
  company: string
  type: string
  content: string
  created_at?: Date
  updated_at?: Date
  created_by?: string
  placement_cycle_id?: string
}

export interface Comment {
  _id?: string
  noticeId: string
  userId: string
  content: string
  created_at?: Date
  user?: {
    name: string
    role: string
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

export function useNoticeApi() {
  const { fetchWithAuth } = useApi()

  const getAllNotices = async (placementCycleId?: string): Promise<Notice[]> => {
    let url = '/api/notices'
    if (placementCycleId) {
      url += `?placement_cycle_id=${placementCycleId}`
    }
    
    const response = await fetchWithAuth(url)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch notices")
    }
    const data = await response.json()
    return data.notices || []
  }

  const getNoticeById = async (id: string): Promise<Notice> => {
    const response = await fetchWithAuth(`/api/notices/${id}`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch notice")
    }
    return response.json()
  }

  const createNotice = async (notice: Omit<Notice, "_id">): Promise<Notice> => {
    const requestBody = {
      ...notice,
      created_at: new Date(),
      updated_at: new Date(),
    }
    
    console.log("Creating notice with data:", requestBody)

    const response = await fetchWithAuth('/api/notices', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Error response:", error)
      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.")
      }
      throw new Error(error.message || "Failed to create notice")
    }

    return response.json()
  }

  const updateNotice = async (id: string, notice: Partial<Notice>): Promise<Notice> => {
    const response = await fetchWithAuth(`/api/notices/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...notice,
        updated_at: new Date(),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update notice")
    }

    return response.json()
  }

  const deleteNotice = async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`/api/notices/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete notice")
    }
  }

  const getCommentsForNotice = async (noticeId: string): Promise<Comment[]> => {
    const response = await fetchWithAuth(`/api/notices/${noticeId}/comments`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch comments")
    }
    return response.json()
  }

  const addComment = async (noticeId: string, content: string): Promise<Comment> => {
    const response = await fetchWithAuth(`/api/notices/${noticeId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        created_at: new Date(),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to add comment")
    }

    return response.json()
  }

  return {
    getAllNotices,
    getNoticeById,
    createNotice,
    updateNotice,
    deleteNotice,
    getCommentsForNotice,
    addComment,
  }
} 