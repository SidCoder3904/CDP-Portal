"use client";

import { useState, useEffect } from "react";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileUploader } from "@/components/file-uploader";
import { ImageCropModal } from "@/components/image-crop-model";
import { useStudentApi, StudentProfile } from "@/lib/api/students";
import { Icons } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function BasicDetails() {
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [editableData, setEditableData] = useState<StudentProfile | null>(null);
  const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);

  const studentApi = useStudentApi();

  useEffect(() => {
    async function fetchStudentData() {
      try {
        setIsLoading(true);
        setError(null);
        const profile = await studentApi.getMyProfile();
        setStudentData(profile);
        setEditableData(profile);
      } catch (error) {
        console.error("Failed to fetch student profile:", error);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudentData();
  }, []);

  const handleDirectUpdate = (field: string, value: string) => {
    if (!editableData) return;
    setEditableData({ ...editableData, [field]: value });
  };

  const handleConfirmUpdate = async () => {
    if (!editableData) return;

    try {
      setIsUpdating(true);
      setError(null);
      const updatedProfile = await studentApi.updateMyProfile(editableData);
      setStudentData(updatedProfile);
      setEditableData(updatedProfile);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (newData: Partial<StudentProfile>) => {
    if (!studentData) return;

    try {
      setIsUpdating(true);
      setError(null);
      const updatedProfile = await studentApi.updateMyProfile(newData);
      setStudentData(updatedProfile);
      setEditableData(updatedProfile);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePassportImageUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsImageCropModalOpen(true);
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    if (!editableData) return;

    try {
      setIsUpdating(true);
      setError(null);
      // Fetch the image from the URL and convert it to a blob
      const response = await fetch(croppedImageUrl);
      const croppedImageBlob = await response.blob();

      // Create a File from the Blob
      const imageFile = new File([croppedImageBlob], "passport-image.jpg", {
        type: "image/jpeg",
      });

      // Upload the image to the server
      const result = await studentApi.uploadPassportImage(imageFile);

      // Update the local state with the new image URL
      const updatedData = { ...studentData!, passportImage: result.imageUrl };
      setStudentData(updatedData);
      setEditableData(updatedData);

      setIsImageCropModalOpen(false);
      setSelectedImage(null); // Clear the selected image after processing
    } catch (error) {
      console.error("Failed to upload image:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile data...</span>
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

  if (!studentData || !editableData) {
    return (
      <div className="p-4">
        <p>Unable to load student profile. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl text-template font-bold mb-6">Basic Details</h1>
      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 flex items-center space-x-4">
              <Avatar 
                className="w-24 h-24 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => studentData.passportImage && setIsProfilePictureModalOpen(true)}
              >
                <AvatarImage src={studentData.passportImage} alt="Passport" />
                <AvatarFallback>
                  {studentData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-2">
                <FileUploader
                  onFileUpload={handlePassportImageUpload}
                  acceptedFileTypes={{ "image/*": [".jpeg", ".jpg", ".png"] }}
                />
                {studentData.verificationStatus?.passportImage && (
                  <Badge
                    variant={
                      studentData.verificationStatus.passportImage ===
                      "verified"
                        ? "default"
                        : studentData.verificationStatus.passportImage ===
                          "rejected"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {studentData.verificationStatus.passportImage === "verified"
                      ? "Verified"
                      : studentData.verificationStatus.passportImage ===
                        "rejected"
                      ? "Rejected"
                      : "Pending"}
                  </Badge>
                )}
              </div>
              {isUpdating && (
                <Icons.spinner className="h-4 w-4 animate-spin ml-2" />
              )}
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editableData.name}
                onChange={(e) => handleDirectUpdate("name", e.target.value)}
              />
              {studentData.verificationStatus?.name && (
                <Badge
                  variant={
                    studentData.verificationStatus.name === "verified"
                      ? "default"
                      : studentData.verificationStatus.name === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                  className="mt-1"
                >
                  {studentData.verificationStatus.name === "verified"
                    ? "Verified"
                    : studentData.verificationStatus.name === "rejected"
                    ? "Rejected"
                    : "Pending"}
                </Badge>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editableData.email}
                onChange={(e) => handleDirectUpdate("email", e.target.value)}
              />
              {studentData.verificationStatus?.email && (
                <Badge
                  variant={
                    studentData.verificationStatus.email === "verified"
                      ? "default"
                      : studentData.verificationStatus.email === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                  className="mt-1"
                >
                  {studentData.verificationStatus.email === "verified"
                    ? "Verified"
                    : studentData.verificationStatus.email === "rejected"
                    ? "Rejected"
                    : "Pending"}
                </Badge>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editableData.phone}
                onChange={(e) => handleDirectUpdate("phone", e.target.value)}
              />
              {studentData.verificationStatus?.phone && (
                <Badge
                  variant={
                    studentData.verificationStatus.phone === "verified"
                      ? "default"
                      : studentData.verificationStatus.phone === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                  className="mt-1"
                >
                  {studentData.verificationStatus.phone === "verified"
                    ? "Verified"
                    : studentData.verificationStatus.phone === "rejected"
                    ? "Rejected"
                    : "Pending"}
                </Badge>
              )}
            </div>
            <DetailItem
              label="Date of Birth"
              value={studentData.dateOfBirth}
              status={studentData.verificationStatus?.dateOfBirth || "pending"}
            />
            <DetailItem
              label="Gender"
              value={studentData.gender}
              status={studentData.verificationStatus?.gender || "pending"}
            />
            <DetailItem
              label="Address"
              value={studentData.address}
              status={studentData.verificationStatus?.address || "pending"}
            />
            <DetailItem
              label="Major"
              value={studentData.major}
              status={studentData.verificationStatus?.major || "pending"}
            />
            <DetailItem
              label="Student ID"
              value={studentData.studentId}
              status={studentData.verificationStatus?.studentId || "pending"}
            />
            <DetailItem
              label="Enrollment Year"
              value={studentData.enrollmentYear}
              status={
                studentData.verificationStatus?.enrollmentYear || "pending"
              }
            />
            <DetailItem
              label="Expected Graduation Year"
              value={studentData.expectedGraduationYear}
              status={
                studentData.verificationStatus?.expectedGraduationYear ||
                "pending"
              }
            />
          </div>
          <div className="flex justify-between mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Confirm Basic Info Updates"
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will update your basic information. Please
                    confirm that the changes are correct.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmUpdate}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <EditDialog
              title="Update Additional Details"
              fields={[
                { name: "dateOfBirth", label: "Date of Birth", type: "date" },
                { name: "gender", label: "Gender", type: "text" },
                { name: "address", label: "Address", type: "text" },
                {
                  name: "major",
                  label: "Major",
                  type: "select",
                  options: ["CSE", "EE", "CE"],
                },
                { name: "studentId", label: "Student ID", type: "text" },
                {
                  name: "enrollmentYear",
                  label: "Enrollment Year",
                  type: "number",
                },
                {
                  name: "expectedGraduationYear",
                  label: "Expected Graduation Year",
                  type: "number",
                },
              ]}
              onSave={handleUpdate}
              triggerButton={
                <Button className="bg-template" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Additional Details"
                  )}
                </Button>
              }
            />
          </div>
        </CardContent>
        {selectedImage && (
          <ImageCropModal
            isOpen={isImageCropModalOpen}
            onClose={() => setIsImageCropModalOpen(false)}
            imageSrc={selectedImage}
            onCropComplete={handleCropComplete}
          />
        )}
        <Dialog open={isProfilePictureModalOpen} onOpenChange={setIsProfilePictureModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Profile Picture</DialogTitle>
            </DialogHeader>
            {studentData.passportImage && (
              <div className="flex justify-center">
                <img
                  src={studentData.passportImage}
                  alt="Profile Picture"
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
