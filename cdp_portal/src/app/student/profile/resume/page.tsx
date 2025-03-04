"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/file-uploader";

export default function Resume() {
  const [resume, setResume] = useState({
    fileName: "Resume.pdf",
    uploadDate: "2023-05-15",
    fileSize: "1.2 MB",
  });

  const handleFileUpload = (file: File) => {
    setResume({
      fileName: file.name,
      uploadDate: new Date().toISOString().split("T")[0],
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    });
  };

  return (
    <div>
      <h1 className="text-2xl text-template font-bold mb-6">Resume</h1>
      <Card>
        <CardHeader>{/* <CardTitle>Resume</CardTitle> */}</CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-gray-600">
              Upload your latest resume here. Make sure it's up to date with all
              your experiences and achievements.
            </p>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Current Resume</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>File Name</Label>
                <Input value={resume.fileName} readOnly />
              </div>
              <div>
                <Label>Upload Date</Label>
                <Input value={resume.uploadDate} readOnly />
              </div>
              <div>
                <Label>File Size</Label>
                <Input value={resume.fileSize} readOnly />
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <FileUploader onFileUpload={handleFileUpload} />
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    `/api/download-resume?fileName=${resume.fileName}`,
                    "_blank"
                  )
                }
              >
                Download Current Resume
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
