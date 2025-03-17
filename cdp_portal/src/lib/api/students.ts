// lib/api/students.ts
import { useApi } from "@/lib/api";

export interface StudentProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  major: string;
  studentId: string;
  enrollmentYear: string;
  expectedGraduationYear: string;
  passportImage: string;
}

export function useStudentApi() {
  const { fetchWithAuth } = useApi();

  // Get profile of the logged-in student
  const getMyProfile = async (): Promise<StudentProfile> => {
    const response = await fetchWithAuth("/api/students/me");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch student profile");
    }
    return response.json();
  };

  // Update profile of the logged-in student
  const updateMyProfile = async (
    data: Partial<StudentProfile>
  ): Promise<StudentProfile> => {
    const response = await fetchWithAuth("/api/students/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update student profile");
    }

    return response.json();
  };

  // Upload passport image
  const uploadPassportImage = async (
    imageFile: File
  ): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append("passportImage", imageFile);

    const response = await fetchWithAuth("/api/students/me/passport-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload passport image");
    }

    return response.json();
  };

  return {
    getMyProfile,
    updateMyProfile,
    uploadPassportImage,
  };
}
