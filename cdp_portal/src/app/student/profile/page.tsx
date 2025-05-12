"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
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
import { cn } from "@/lib/utils";
import { Check, X, AlertCircle } from "lucide-react";

const phoneRegex = /^\+?[1-9]\d{9,10}$/;

const directEditableSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z
    .string()
    .regex(phoneRegex, { message: "Invalid phone number format" }),
});

const additionalDetailsSchema = z
  .object({
    dateOfBirth: z.string().min(1, { message: "Date of Birth is required" }),
    gender: z.enum(["Male", "Female", "Other"], {
      errorMap: () => ({ message: "Please select a valid gender" }),
    }),
    address: z.string().min(1, { message: "Address is required" }),
    major: z.enum(["CSE", "EE", "CE"], {
      errorMap: () => ({ message: "Please select a valid major" }),
    }),
    studentId: z.string().min(1, { message: "Student ID is required" }),
    enrollmentYear: z.coerce
      .number()
      .int()
      .min(2000, { message: "Invalid year" })
      .max(new Date().getFullYear(), { message: "Invalid year" }),
    expectedGraduationYear: z.coerce
      .number()
      .int()
      .min(2000, { message: "Invalid year" })
      .max(new Date().getFullYear() + 10, { message: "Invalid year" }),
  })
  .refine(
    (data) => {
      return data.expectedGraduationYear > data.enrollmentYear;
    },
    {
      message: "Expected graduation year must be after enrollment year",
      path: ["expectedGraduationYear"],
    }
  );

type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export default function BasicDetails() {
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [editableData, setEditableData] = useState<StudentProfile | null>(null);
  const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);
  const [directEditErrors, setDirectEditErrors] = useState<
    ValidationErrors<z.infer<typeof directEditableSchema>>
  >({});
  const [isAdditionalDetailsDialogOpen, setIsAdditionalDetailsDialogOpen] =
    useState(false);

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

  const handleDirectUpdate = (
    field: keyof z.infer<typeof directEditableSchema>,
    value: string
  ) => {
    if (!editableData) return;

    setEditableData({ ...editableData, [field]: value });

    const fieldSchema = directEditableSchema.shape[field];
    const result = fieldSchema.safeParse(value);

    setDirectEditErrors((prevErrors) => ({
      ...prevErrors,
      [field]: result.success ? undefined : result.error.errors[0]?.message,
    }));
  };

  const handleConfirmUpdate = async () => {
    if (!editableData) return;

    const result = directEditableSchema.safeParse({
      name: editableData.name,
      email: editableData.email,
      phone: editableData.phone,
    });

    if (!result.success) {
      const errors: ValidationErrors<z.infer<typeof directEditableSchema>> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof z.infer<typeof directEditableSchema>;
        errors[key] = issue.message;
      });
      setDirectEditErrors(errors);
      console.log("Direct edit validation failed:", errors);
      return;
    }

    setDirectEditErrors({});

    try {
      setIsUpdating(true);
      setError(null);

      // Check which fields have been modified
      const dataToUpdate: Partial<StudentProfile> = {};
      const fieldsWithVerificationStatus: Record<string, string> = {};

      // Check each field and add to update only if changed
      if (result.data.name !== studentData?.name) {
        dataToUpdate.name = result.data.name;
        fieldsWithVerificationStatus.name = "pending";
      }

      if (result.data.email !== studentData?.email) {
        dataToUpdate.email = result.data.email;
        fieldsWithVerificationStatus.email = "pending";
      }

      if (result.data.phone !== studentData?.phone) {
        dataToUpdate.phone = result.data.phone;
        fieldsWithVerificationStatus.phone = "pending";
      }

      // Only update if there are changes
      if (Object.keys(dataToUpdate).length > 0) {
        // Add verification status for changed fields
        if (Object.keys(fieldsWithVerificationStatus).length > 0) {
          dataToUpdate.verificationStatus = {
            ...studentData?.verificationStatus,
            ...fieldsWithVerificationStatus,
          };
        }

        const updatedProfile = await studentApi.updateMyProfile(dataToUpdate);
        setStudentData(updatedProfile);
        setEditableData(updatedProfile);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdditionalDetailsUpdate = async (
    newData: Partial<StudentProfile>
  ) => {
    if (!studentData) return;

    try {
      setIsUpdating(true);
      setError(null);

      // Check which fields have been modified
      const dataToUpdate: Partial<StudentProfile> = {};
      const fieldsWithVerificationStatus: Record<string, string> = {};

      // Check each field and add to update only if changed
      if (
        "dateOfBirth" in newData &&
        newData.dateOfBirth !== studentData.dateOfBirth
      ) {
        dataToUpdate.dateOfBirth = newData.dateOfBirth;
        fieldsWithVerificationStatus.dateOfBirth = "pending";
      }

      if ("gender" in newData && newData.gender !== studentData.gender) {
        dataToUpdate.gender = newData.gender;
        fieldsWithVerificationStatus.gender = "pending";
      }

      if ("address" in newData && newData.address !== studentData.address) {
        dataToUpdate.address = newData.address;
        fieldsWithVerificationStatus.address = "pending";
      }

      if ("major" in newData && newData.major !== studentData.major) {
        dataToUpdate.major = newData.major;
        fieldsWithVerificationStatus.major = "pending";
      }

      if (
        "studentId" in newData &&
        newData.studentId !== studentData.studentId
      ) {
        dataToUpdate.studentId = newData.studentId;
        fieldsWithVerificationStatus.studentId = "pending";
      }

      if (
        "enrollmentYear" in newData &&
        newData.enrollmentYear !== studentData.enrollmentYear
      ) {
        dataToUpdate.enrollmentYear = newData.enrollmentYear;
        fieldsWithVerificationStatus.enrollmentYear = "pending";
      }

      if (
        "expectedGraduationYear" in newData &&
        newData.expectedGraduationYear !== studentData.expectedGraduationYear
      ) {
        dataToUpdate.expectedGraduationYear = newData.expectedGraduationYear;
        fieldsWithVerificationStatus.expectedGraduationYear = "pending";
      }

      // Only update if there are changes
      if (Object.keys(dataToUpdate).length > 0) {
        // Add verification status for changed fields
        if (Object.keys(fieldsWithVerificationStatus).length > 0) {
          dataToUpdate.verificationStatus = {
            ...studentData.verificationStatus,
            ...fieldsWithVerificationStatus,
          };
        }

        const updatedProfile = await studentApi.updateMyProfile(dataToUpdate);
        setStudentData(updatedProfile);
        setEditableData(updatedProfile);
        setIsAdditionalDetailsDialogOpen(false);
      } else {
        // If no changes, just close the dialog
        setIsAdditionalDetailsDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to update profile (additional details):", error);
      setError("Failed to update additional details. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePassportImageUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsImageCropModalOpen(true);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!editableData) return;

    try {
      setIsUpdating(true);
      setError(null);
      
      // No need to fetch the blob URL anymore
      // const response = await fetch(croppedImageUrl);
      // const croppedImageBlob = await response.blob();

      // Create the File object directly from the Blob
      const imageFile = new File([croppedImageBlob], "passport-image.jpg", {
        type: "image/jpeg",
      });

      // Call the API function with the File object
      const result = await studentApi.uploadPassportImage(imageFile);

      const updatedData = { ...studentData!, passportImage: result.imageUrl };
      setStudentData(updatedData);
      setEditableData(updatedData);

      setIsImageCropModalOpen(false);
      setSelectedImage(null); // Clear the temporary preview URL
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
        <CardHeader className="pb-2">
          <h2 className="text-xl font-semibold">Personal Information</h2>
        </CardHeader>
        <CardContent>
          {/* Profile Image Section */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <Avatar
                className="w-24 h-24 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  studentData.passportImage &&
                  setIsProfilePictureModalOpen(true)
                }
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
                  <div className="flex items-center mt-1">
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
                      className={cn(
                        "flex items-center",
                        studentData.verificationStatus.passportImage ===
                          "verified" && "bg-template text-white"
                      )}
                    >
                      {studentData.verificationStatus.passportImage ===
                      "verified" ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : studentData.verificationStatus.passportImage ===
                        "rejected" ? (
                        <X className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertCircle className="mr-1 h-3 w-3" />
                      )}
                      {studentData.verificationStatus.passportImage ===
                      "verified"
                        ? "Verified"
                        : studentData.verificationStatus.passportImage ===
                          "rejected"
                        ? "Rejected"
                        : "Pending"}
                    </Badge>
                    {isUpdating && (
                      <Icons.spinner className="h-4 w-4 animate-spin ml-2" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editable Fields Section */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-md font-bold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label htmlFor="name" className="block mb-1">
                  Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={editableData.name}
                    onChange={(e) => handleDirectUpdate("name", e.target.value)}
                    className={cn(
                      directEditErrors.name ? "border-red-500" : ""
                    )}
                  />
                  {directEditErrors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {directEditErrors.name}
                    </p>
                  )}
                </div>
                {studentData.verificationStatus?.name && (
                  <div className="mt-1">
                    <Badge
                      variant={
                        studentData.verificationStatus.name === "verified"
                          ? "default"
                          : studentData.verificationStatus.name === "rejected"
                          ? "destructive"
                          : "outline"
                      }
                      className={cn(
                        "",
                        studentData.verificationStatus.name === "verified" &&
                          "bg-template text-white"
                      )}
                    >
                      {studentData.verificationStatus.name === "verified" ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : studentData.verificationStatus.name === "rejected" ? (
                        <X className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertCircle className="mr-1 h-3 w-3" />
                      )}
                      {studentData.verificationStatus.name === "verified"
                        ? "Verified"
                        : studentData.verificationStatus.name === "rejected"
                        ? "Rejected"
                        : "Pending"}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="block mb-1">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={editableData.email}
                    onChange={(e) =>
                      handleDirectUpdate("email", e.target.value)
                    }
                    className={cn(
                      directEditErrors.email ? "border-red-500" : ""
                    )}
                  />
                  {directEditErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {directEditErrors.email}
                    </p>
                  )}
                </div>
                {studentData.verificationStatus?.email && (
                  <div className="mt-1">
                    <Badge
                      variant={
                        studentData.verificationStatus.email === "verified"
                          ? "default"
                          : studentData.verificationStatus.email === "rejected"
                          ? "destructive"
                          : "outline"
                      }
                      className={cn(
                        "",
                        studentData.verificationStatus.email === "verified" &&
                          "bg-template text-white"
                      )}
                    >
                      {studentData.verificationStatus.email === "verified" ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : studentData.verificationStatus.email ===
                        "rejected" ? (
                        <X className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertCircle className="mr-1 h-3 w-3" />
                      )}
                      {studentData.verificationStatus.email === "verified"
                        ? "Verified"
                        : studentData.verificationStatus.email === "rejected"
                        ? "Rejected"
                        : "Pending"}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="block mb-1">
                  Phone
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    value={editableData.phone}
                    onChange={(e) =>
                      handleDirectUpdate("phone", e.target.value)
                    }
                    className={cn(
                      directEditErrors.phone ? "border-red-500" : ""
                    )}
                  />
                  {directEditErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                      {directEditErrors.phone}
                    </p>
                  )}
                </div>
                {studentData.verificationStatus?.phone && (
                  <div className="mt-1">
                    <Badge
                      variant={
                        studentData.verificationStatus.phone === "verified"
                          ? "default"
                          : studentData.verificationStatus.phone === "rejected"
                          ? "destructive"
                          : "outline"
                      }
                      className={cn(
                        "",
                        studentData.verificationStatus.phone === "verified" &&
                          "bg-template text-white"
                      )}
                    >
                      {studentData.verificationStatus.phone === "verified" ? (
                        <Check className="mr-1 h-3 w-3" />
                      ) : studentData.verificationStatus.phone ===
                        "rejected" ? (
                        <X className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertCircle className="mr-1 h-3 w-3" />
                      )}
                      {studentData.verificationStatus.phone === "verified"
                        ? "Verified"
                        : studentData.verificationStatus.phone === "rejected"
                        ? "Rejected"
                        : "Pending"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={
                      isUpdating ||
                      Object.values(directEditErrors).some(
                        (e) => e !== undefined
                      )
                    }
                  >
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
                      This action will update your basic information (Name,
                      Email, Phone). Please confirm that the changes are
                      correct.
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
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="mb-6">
            <h3 className="text-md font-bold mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem
                label="Date of Birth"
                value={studentData.dateOfBirth}
                status={
                  studentData.verificationStatus?.dateOfBirth || "pending"
                }
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-2">
            <EditDialog
              title="Update Additional Details"
              description="Edit your additional profile information."
              fields={[
                { name: "dateOfBirth", label: "Date of Birth", type: "date" },
                {
                  name: "gender",
                  label: "Gender",
                  type: "select",
                  options: ["Male", "Female", "Other"],
                },
                {
                  name: "address",
                  label: "Address",
                  type: "text",
                  placeholder: "Enter your full address",
                },
                {
                  name: "major",
                  label: "Major",
                  type: "select",
                  options: ["CSE", "EE", "CE"],
                  placeholder: "Select your major",
                },
                {
                  name: "studentId",
                  label: "Student ID",
                  type: "text",
                  placeholder: "Enter your student ID",
                },
                {
                  name: "enrollmentYear",
                  label: "Enrollment Year",
                  type: "number",
                  placeholder: "YYYY",
                },
                {
                  name: "expectedGraduationYear",
                  label: "Expected Graduation Year",
                  type: "number",
                  placeholder: "YYYY",
                },
              ]}
              initialData={{
                dateOfBirth: editableData.dateOfBirth,
                gender: editableData.gender,
                address: editableData.address,
                major: editableData.major,
                studentId: editableData.studentId,
                enrollmentYear: editableData.enrollmentYear,
                expectedGraduationYear: editableData.expectedGraduationYear,
              }}
              zodSchema={additionalDetailsSchema.innerType()}
              onSaveValidated={handleAdditionalDetailsUpdate}
              isOpen={isAdditionalDetailsDialogOpen}
              onOpenChange={setIsAdditionalDetailsDialogOpen}
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
            onClose={() => {
              setIsImageCropModalOpen(false);
              setSelectedImage(null); // Also clear preview URL on manual close
            }}
            imageSrc={selectedImage}
            onCropComplete={handleCropComplete}
          />
        )}
        <Dialog
          open={isProfilePictureModalOpen}
          onOpenChange={setIsProfilePictureModalOpen}
        >
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
