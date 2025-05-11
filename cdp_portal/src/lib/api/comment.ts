import { useApi } from "@/lib/api"

export interface Comment {
  _id: string
  content: string
  user: string
  user_type: "admin" | "student"
  placement_cycle_id: string
  created_at: string
  updated_at: string
}

export function useCommentApi() {
  const { fetchWithAuth } = useApi()

  const getComments = async (placementCycleId: string): Promise<Comment[]> => {
    try {
      const response = await fetchWithAuth(`/api/comments?placement_cycle_id=${placementCycleId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Received comments:', data)
      return data
    } catch (error) {
      console.error('Error fetching comments:', error)
      throw error
    }
  }

  const createComment = async (data: Omit<Comment, "_id" | "created_at" | "updated_at">): Promise<Comment> => {
    try {
      const response = await fetchWithAuth('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  }

  return {
    getComments,
    createComment,
  }
} 