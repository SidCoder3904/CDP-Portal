"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: Record<string, string[]>;
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
}: FileUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFileName(file.name);
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: false,
  });

  return (
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
      <Button className="mt-4 bg-template" type="button">
        Upload File
      </Button>
    </div>
  );
}
