"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/file-uploader";
import { useStudentApi, Resume } from "@/lib/api/students";
import { Icons } from "@/components/icons";

export default function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentApi = useStudentApi();

  useEffect(() => {
    async function fetchResumeData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await studentApi.getMyResume();
        setResume(data);
      } catch (error) {
        console.error("Failed to fetch resume data:", error);
        setError("Failed to load resume data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchResumeData();
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedResume = await studentApi.uploadResume(file);
      setResume(updatedResume);
    } catch (error) {
      console.error("Failed to upload resume:", error);
      setError("Failed to upload resume. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading resume data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl text-template font-bold mb-6">Resume</h1>
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-gray-600">
              Upload your latest resume here. Make sure it's up to date with all
              your experiences and achievements.
            </p>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Current Resume</h2>
            {resume && resume.resume_details?.fileName?.current_value ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>File Name</Label>
                  <Input
                    value={resume.resume_details.fileName.current_value}
                    readOnly
                  />
                </div>
                <div>
                  <Label>Upload Date</Label>
                  <Input
                    value={new Date(
                      resume.resume_details.uploadDate.current_value
                    ).toLocaleDateString()}
                    readOnly
                  />
                </div>
                <div>
                  <Label>File Size</Label>
                  <Input
                    value={resume.resume_details.fileSize.current_value}
                    readOnly
                  />
                </div>
                {resume.is_verified && (
                  <div>
                    <Label>Verification Status</Label>
                    <div className="text-sm text-green-600 mt-2">
                      Verified on:{" "}
                      {new Date(
                        resume.last_verified || ""
                      ).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {resume.remark && (
                  <div className="col-span-2">
                    <Label>Remarks</Label>
                    <div className="text-sm text-gray-600 mt-2">
                      {resume.remark}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-md">
                <p className="text-gray-500">No resume uploaded yet.</p>
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-4">
            <FileUploader
              onFileUpload={handleFileUpload}
              acceptedFileTypes={{
                "application/pdf": [".pdf"],
                "application/msword": [".doc"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
              }}
            />
            {isUpdating && (
              <div className="flex items-center justify-center">
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                <span>Uploading resume...</span>
              </div>
            )}
            {resume && resume.resume_details?.fileName?.current_value && (
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `/api/download-resume?fileName=${resume.resume_details.fileName.current_value}`,
                      "_blank"
                    )
                  }
                  disabled={isUpdating}
                >
                  Download Current Resume
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
