"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useStudentApi } from "@/lib/api/students";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const resumeSchema = z.object({
  resumeName: z.string().min(1, "Resume name cannot be empty"),
});

interface Resume {
  _id: string;
  resume_name: string;
  file_name: string;
  upload_date: string;
  file_size: string;
  file_url: string;
  public_id: string;
  student_id: string;
  created_at: string;
  updated_at: string;
}

export default function ResumePage() {
  const studentApi = useStudentApi();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeName, setResumeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeNameError, setResumeNameError] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await studentApi.getResumes();
      setResumes(data);
    } catch (err) {
      setError("Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const validationResult = resumeSchema.safeParse({ resumeName });
      if (!validationResult.success) {
        setResumeNameError(
          validationResult.error.errors[0]?.message || "Invalid name"
        );
        return;
      }
      setResumeNameError(null);

      setUpdating(true);
      setError(null);

      const newResume = await studentApi.uploadResume(resumeName, file);
      setResumes((prev) => [...prev, newResume]);
      setResumeName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload resume");
    } finally {
      setUpdating(false);
    }
  };

  const handleResumeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeName(e.target.value);
    if (resumeNameError) {
      setResumeNameError(null);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await studentApi.deleteResume(resumeId);
      setResumes((prev) => prev.filter((resume) => resume._id !== resumeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete resume");
    }
  };

  const handleDownloadResume = async (resumeId: string) => {
    try {
      const response = await studentApi.downloadResume(resumeId);
      const { file_url, file_name } = response;

      // Create a temporary link element for download
      const link = document.createElement("a");
      link.href = file_url;
      link.download = file_name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download resume"
      );
    }
  };

  const handleViewResume = async (resumeId: string) => {
    try {
      const response = await studentApi.viewResume(resumeId);
      const { file_url } = response;

      // Open the PDF in a new tab for viewing
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Resume</title>
              <style>
                body { margin: 0; padding: 0; }
                embed { width: 100%; height: 100vh; }
              </style>
            </head>
            <body>
              <embed src="${file_url}" type="application/pdf" />
            </body>
          </html>
        `);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to view resume");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-1 text-template">
      <h1 className="text-2xl font-bold mb-6">My Resumes</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload New Resume</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Resume Name (optional)"
            value={resumeName}
            onChange={handleResumeNameChange}
            className="w-full p-2 border rounded"
          />
          {resumeNameError && (
            <p className="text-xs text-red-500 mt-1">{resumeNameError}</p>
          )}
          <FileUploader
            onFileUpload={handleFileUpload}
            acceptedFileTypes={{
              "application/pdf": [".pdf"],
            }}
            maxSize={5 * 1024 * 1024}
          />
        </div>
      </Card>

      <div className="grid gap-4">
        {resumes.map((resume) => (
          <Card key={resume._id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{resume.resume_name}</h3>
                <p className="text-sm text-gray-500">
                  Uploaded on {resume.upload_date} • {resume.file_size}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleViewResume(resume._id)}
                  title="View Resume"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDownloadResume(resume._id)}
                  title="Download Resume"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteResume(resume._id)}
                  title="Delete Resume"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
