// lib/api/students.ts
import { useApi } from "@/lib/api";

export interface VerificationStatus {
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
  lastVerifiedValue?: string;
}

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
  verificationStatus?: {
    dateOfBirth: boolean;
    gender: boolean;
    address: boolean;
    major: boolean;
    studentId: boolean;
    enrollmentYear: boolean;
    expectedGraduationYear: boolean;
  };
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  gpa: string;
  major: string;
  minor: string;
  relevantCourses: string;
  honors: string;
  isVerified: {
    institution: boolean;
    year: boolean;
    gpa: boolean;
    major: boolean;
    minor: boolean;
    relevantCourses: boolean;
    honors: boolean;
  };
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
  technologies: string;
  achievements: string;
  skills: string;
  isVerified: {
    company: boolean;
    position: boolean;
    duration: boolean;
    description: boolean;
    technologies: boolean;
    achievements: boolean;
    skills: boolean;
  };
}

export interface Position {
  id: string;
  title: string;
  organization: string;
  duration: string;
  description: string;
  responsibilities: string;
  achievements: string;
  isVerified: {
    organization: boolean;
    duration: boolean;
    description: boolean;
    responsibilities: boolean;
    achievements: boolean;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  duration: string;
  role: string;
  teamSize: string;
  githubLink: string;
  demoLink: string;
  isVerified: {
    description: boolean;
    technologies: boolean;
    duration: boolean;
    role: boolean;
    teamSize: boolean;
    githubLink: boolean;
    demoLink: boolean;
  };
}

export interface Resume {
  fileName: string;
  uploadDate: string;
  fileSize: string;
  fileUrl: string;
}

export function useStudentApi() {
  const { fetchWithAuth } = useApi();

  // Basic Details
  const getMyProfile = async (): Promise<StudentProfile> => {
    const response = await fetchWithAuth("/api/students/me");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch student profile");
    }
    return response.json();
  };

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
    console.log("Updating profile with data:", data);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update student profile");
    }

    return response.json();
  };

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

  // Education
  const getMyEducation = async (): Promise<Education[]> => {
    const response = await fetchWithAuth("/api/students/me/education");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch education records");
    }
    return response.json();
  };

  const addEducation = async (data: Partial<Education>): Promise<Education> => {
    const response = await fetchWithAuth("/api/students/me/education", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add education record");
    }

    return response.json();
  };

  const updateEducation = async (
    id: string,
    data: Partial<Education>
  ): Promise<Education> => {
    const response = await fetchWithAuth(`/api/students/me/education/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update education record");
    }

    return response.json();
  };

  const deleteEducation = async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`/api/students/me/education/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete education record");
    }
  };

  // Experience
  const getMyExperience = async (): Promise<Experience[]> => {
    const response = await fetchWithAuth("/api/students/me/experience");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch experience records");
    }
    return response.json();
  };

  const addExperience = async (
    data: Partial<Experience>
  ): Promise<Experience> => {
    const response = await fetchWithAuth("/api/students/me/experience", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add experience record");
    }

    return response.json();
  };

  const updateExperience = async (
    id: string,
    data: Partial<Experience>
  ): Promise<Experience> => {
    const response = await fetchWithAuth(`/api/students/me/experience/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update experience record");
    }

    return response.json();
  };

  const deleteExperience = async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`/api/students/me/experience/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete experience record");
    }
  };

  // Positions
  const getMyPositions = async (): Promise<Position[]> => {
    const response = await fetchWithAuth("/api/students/me/positions");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch position records");
    }
    return response.json();
  };

  const addPosition = async (data: Partial<Position>): Promise<Position> => {
    const response = await fetchWithAuth("/api/students/me/positions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add position record");
    }

    return response.json();
  };

  const updatePosition = async (
    id: string,
    data: Partial<Position>
  ): Promise<Position> => {
    const response = await fetchWithAuth(`/api/students/me/positions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update position record");
    }

    return response.json();
  };

  const deletePosition = async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`/api/students/me/positions/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete position record");
    }
  };

  // Projects
  const getMyProjects = async (): Promise<Project[]> => {
    const response = await fetchWithAuth("/api/students/me/projects");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch project records");
    }
    return response.json();
  };

  const addProject = async (data: Partial<Project>): Promise<Project> => {
    const response = await fetchWithAuth("/api/students/me/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add project record");
    }

    return response.json();
  };

  const updateProject = async (
    id: string,
    data: Partial<Project>
  ): Promise<Project> => {
    const response = await fetchWithAuth(`/api/students/me/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update project record");
    }

    return response.json();
  };

  const deleteProject = async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`/api/students/me/projects/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete project record");
    }
  };

  // Resume
  const getMyResume = async (): Promise<Resume> => {
    const response = await fetchWithAuth("/api/students/me/resume");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch resume");
    }
    return response.json();
  };

  const uploadResume = async (resumeFile: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append("resume", resumeFile);

    const response = await fetchWithAuth("/api/students/me/resume", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload resume");
    }

    return response.json();
  };

  return {
    getMyProfile,
    updateMyProfile,
    uploadPassportImage,
    getMyEducation,
    addEducation,
    updateEducation,
    deleteEducation,
    getMyExperience,
    addExperience,
    updateExperience,
    deleteExperience,
    getMyPositions,
    addPosition,
    updatePosition,
    deletePosition,
    getMyProjects,
    addProject,
    updateProject,
    deleteProject,
    getMyResume,
    uploadResume,
  };
}
