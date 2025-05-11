import { useApi } from "@/lib/api"
import type { StudentProfile } from "./students"

export interface StudentListItem {
  _id: string
  name: string
  studentId: string
  cgpa: number
  major: string
  isVerified: boolean
}

export interface StudentVerification {
  [key: string]: "verified" | "rejected" | "pending"
}

export interface StudentDetail extends StudentProfile {
  cgpa: number
  branch: string
  verification: StudentVerification
  education: Array<{
    _id: string
    student_id: string
    education_details: {
      institution: {
        current_value: string | null
        last_verified_value: string | null
      }
      gpa: {
        current_value: string | null
        last_verified_value: string | null
      }
      year: {
        current_value: string | null
        last_verified_value: string | null
      }
      major: {
        current_value: string | null
        last_verified_value: string | null
      }
      minor: {
        current_value: string | null
        last_verified_value: string | null
      }
      relevant_courses: {
        current_value: string | null
        last_verified_value: string | null
      }
      honors: {
        current_value: string | null
        last_verified_value: string | null
      }
    }
    is_verified: boolean
    created_at: string
    updated_at: string
  }>
  positions: Array<{
    _id: string
    student_id: string
    position_details: {
      [key: string]: {
        current_value: string | null
        last_verified_value: string | null
      }
    }
    is_verified: boolean
    created_at: string
    updated_at: string
  }>
  projects: Array<{
    _id: string
    student_id: string
    project_details: {
      [key: string]: {
        current_value: string | null
        last_verified_value: string | null
      }
    }
    is_verified: boolean
    created_at: string
    updated_at: string
  }>
  experience: Array<{
    _id: string
    student_id: string
    experience_details: {
      [key: string]: {
        current_value: string | null
        last_verified_value: string | null
      }
    }
    is_verified: boolean
    created_at: string
    updated_at: string
  }>
}

export interface StudentFilters {
  branch?: string
  minCgpa?: string
  rollNumber?: string
  page?: number
  perPage?: number
}

export function useAdminApi() {
  const { fetchWithAuth } = useApi()

  // Get all students with optional filtering
  const getStudents = async (filters?: StudentFilters): Promise<{ students: StudentListItem[]; total: number }> => {
    // Build query string from filters
    const queryParams = new URLSearchParams()

    if (filters?.branch && filters.branch !== "all") {
      queryParams.append("branch", filters.branch)
    }

    if (filters?.minCgpa && filters.minCgpa !== "any") {
      queryParams.append("min_cgpa", filters.minCgpa)
    }

    if (filters?.rollNumber) {
      queryParams.append("roll_number", filters.rollNumber)
    }

    if (filters?.page) {
      queryParams.append("page", filters.page.toString())
    }

    if (filters?.perPage) {
      queryParams.append("per_page", filters.perPage.toString())
    }

    const queryString = queryParams.toString()
    const url = `/api/admin/verification${queryString ? `?${queryString}` : ""}`

    const response = await fetchWithAuth(url)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch students")
    }

    return response.json()
  }

  // Get a single student's details by ID
  const getStudentById = async (studentId: string): Promise<StudentDetail> => {
    const response = await fetchWithAuth(`/api/admin/verification/${studentId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch student details")
    }

    return response.json()
  }

  // Update a student's verification status
  const updateVerificationStatus = async (
    studentId: string,
    field: string,
    status: "verified" | "rejected",
    comments?: string,
  ): Promise<StudentDetail> => {
    const response = await fetchWithAuth(`/api/admin/verification/${studentId}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        field,
        status,
        comments,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update verification status")
    }

    return response.json()
  }

  // Verify all fields for a student
  const verifyAllFields = async (studentId: string): Promise<StudentDetail> => {
    const response = await fetchWithAuth(`/api/admin/verification/${studentId}/verify-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to verify all fields")
    }

    return response.json()
  }

  return {
    getStudents,
    getStudentById,
    updateVerificationStatus,
    verifyAllFields,
  }
}

