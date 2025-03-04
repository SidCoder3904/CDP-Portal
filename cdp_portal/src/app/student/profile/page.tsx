"use client";

import { useState } from "react";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Placeholder data
const initialStudentData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 234 567 8900",
  dateOfBirth: "1999-01-01",
  gender: "Male",
  address: "123 College St, University Town, ST 12345",
  major: "Computer Science",
  studentId: "CS12345",
  enrollmentYear: "2020",
  expectedGraduationYear: "2024",
  passportImage: "/placeholder.svg?height=200&width=200",
};

export default function BasicDetails() {
  const [studentData, setStudentData] = useState(initialStudentData);
  const [editableData, setEditableData] = useState(initialStudentData);
  const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDirectUpdate = (field: string, value: string) => {
    setEditableData({ ...editableData, [field]: value });
  };

  const handleConfirmUpdate = () => {
    setStudentData(editableData);
  };

  const handleUpdate = (newData: Partial<typeof studentData>) => {
    setStudentData({ ...studentData, ...newData });
    setEditableData({ ...editableData, ...newData });
  };

  const handlePassportImageUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsImageCropModalOpen(true);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setStudentData({ ...studentData, passportImage: croppedImageUrl });
    setEditableData({ ...editableData, passportImage: croppedImageUrl });
  };

  return (
    <div>
      <h1 className="text-2xl text-template font-bold mb-6">Basic Details</h1>
      <Card>
        <CardHeader>
          {/* <CardTitle className="text-2xl text-template font-bold mb-6">
          Basic Details
        </CardTitle> */}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 flex items-center space-x-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={studentData.passportImage} alt="Passport" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <FileUploader
                onFileUpload={handlePassportImageUpload}
                acceptedFileTypes={{ "image/*": [".jpeg", ".jpg", ".png"] }}
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editableData.name}
                onChange={(e) => handleDirectUpdate("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editableData.email}
                onChange={(e) => handleDirectUpdate("email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editableData.phone}
                onChange={(e) => handleDirectUpdate("phone", e.target.value)}
              />
            </div>
            <DetailItem
              label="Date of Birth"
              value={studentData.dateOfBirth}
              isVerified={true}
            />
            <DetailItem
              label="Gender"
              value={studentData.gender}
              isVerified={true}
            />
            <DetailItem
              label="Address"
              value={studentData.address}
              isVerified={false}
            />
            <DetailItem
              label="Major"
              value={studentData.major}
              isVerified={true}
            />
            <DetailItem
              label="Student ID"
              value={studentData.studentId}
              isVerified={true}
            />
            <DetailItem
              label="Enrollment Year"
              value={studentData.enrollmentYear}
              isVerified={true}
            />
            <DetailItem
              label="Expected Graduation Year"
              value={studentData.expectedGraduationYear}
              isVerified={true}
            />
          </div>
          <div className="flex justify-between mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Confirm Basic Info Updates</Button>
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
                { name: "major", label: "Major", type: "text" },
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
              triggerButton={<Button>Update Additional Details</Button>}
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
      </Card>
    </div>
  );
}
