"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: Record<string, string[]>;
  maxSize?: number; // in bytes
}

export function FileUploader({
  onFileUpload,
  acceptedFileTypes = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  },
  maxSize = 5 * 1024 * 1024, // 5MB default
}: FileUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);
      
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type. Please check accepted formats.');
        } else {
          setError('Error uploading file. Please try again.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFileName(file.name);
        onFileUpload(file);
      }
    },
    [onFileUpload, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: false,
    maxSize,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        {fileName ? (
          <p className="mt-2 text-sm text-gray-600">{fileName}</p>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your file here, or click to select a file
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Supported formats: {Object.values(acceptedFileTypes).flat().join(", ")}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Maximum size: {maxSize / (1024 * 1024)}MB
        </p>
        <Button className="mt-4 bg-template" type="button">
          Upload File
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
