import { useApi } from "@/lib/api";

export interface JobListing {
  _id: string
  cycleId: string
  company: string
  role: string
  package: string
  location?: string
  deadline?: string
  accommodation?: boolean
  eligibility: {
    uniformCgpa: boolean
    cgpa: string | null
    cgpaCriteria?: {
      [branch: string]: {
        [program: string]: string
      }
    }
    gender: string
    branches: string[]
    programs: string[]
  }
  hiringFlow: Array<{
    step: string
    description: string
  }>
  jobDescription: string | string[]
  status: string
  createdAt: string
  updatedAt: string
  hasApplied: boolean
  isEligible: boolean
  jobType: string
  logo?: string
  jobFunctions?: string[]
}

export interface JobApplication {
  _id: string;
  jobId: string;
  studentId: string;
  status: string;
  currentStage: string;
  appliedAt: string;
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
  cgpa:number
}

export function useJobsApi() {
  const { fetchWithAuth } = useApi();

  const getJobs = async (): Promise<JobListing[]> => {
    const response = await fetchWithAuth('/api/jobs');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch jobs');
    }
    
    const data = await response.json();
    
    // Handle both array response and paginated response format
    if (Array.isArray(data)) {
      return data.map(formatJobData);
    } else if (data.jobs && Array.isArray(data.jobs)) {
      return data.jobs.map(formatJobData);
    }
    
    return [];
  };

  // Helper function to format job data
  const formatJobData = (job: any): JobListing => {
    // Convert MongoDB ObjectId format if present
    const id = job._id?.$oid || job._id || '';
    
    // Format dates if they're in MongoDB format
    const createdAt = job.createdAt?.$date || job.createdAt;
    const updatedAt = job.updatedAt?.$date || job.updatedAt;
    
    return {
      ...job,
      _id: id,
      createdAt,
      updatedAt,
      // Set default job type if not present
      jobType: job.jobType || (job.stipend ? "Internship" : "Placement")
    };
  };

  const getJobById = async (jobId: string): Promise<JobListing> => {
    const response = await fetchWithAuth(`/api/jobs/${jobId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch job details');
    }
    return response.json();
  };

  const applyForJob = async (jobId: string, resumeId: string): Promise<JobApplication> => {
    console.log(JSON.stringify({ resumeId }));
    const response = await fetchWithAuth(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ resumeId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply for job');
    }
    
    return response.json();
  };

  const getMyApplications = async (): Promise<JobApplication[]> => {
    const response = await fetchWithAuth('/api/students/me/applications');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch applications');
    }
    return response.json();
  };

  const getJobApplications = async (jobId: string): Promise<StudentProfile[]> => {
    const response = await fetchWithAuth(`/api/jobs/${jobId}/applications`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch applications');
    }
    return response.json();
  };

  return {
    getJobs,
    getJobById,
    applyForJob,
    getMyApplications,
    getJobApplications
  };
} 