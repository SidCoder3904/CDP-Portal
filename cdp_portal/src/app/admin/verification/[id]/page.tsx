"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Check, X, AlertCircle } from "lucide-react";
import { useAdminApi, type StudentDetail } from "@/lib/api/admin";
import { Icons } from "@/components/icons";
import React from "react";

interface VerificationItemProps {
  label: string;
  value: string;
  status: "verified" | "rejected" | "pending";
  onVerify: () => void;
  onReject: () => void;
  isUpdating: boolean;
}

function VerificationItem({
  label,
  value,
  status,
  onVerify,
  onReject,
  isUpdating,
}: VerificationItemProps) {
  const handleToggle = () => {
    if (status === "verified") {
      onReject();
    } else {
      onVerify();
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-4">
        <div>
          <span className="text-muted-foreground">{label}:</span>
          <span className="ml-2">{value}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {isUpdating && <Icons.spinner className="h-4 w-4 animate-spin" />}
        <Badge
          variant={status === "verified" ? "default" : "destructive"}
          className={
            "cursor-pointer hover:opacity-80 transition-opacity " +
            (status === "verified" ? "bg-template" : "bg-destructive")
          }
          onClick={handleToggle}
        >
          {status === "verified" ? "Verified" : "Not Verified"}
        </Badge>
      </div>
    </div>
  );
}

export default function StudentVerificationPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = (params?.id as string) || "";
  const adminApi = useAdminApi();

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  // Helper function to render verification button
  const renderVerificationButton = (field: string, isVerified: boolean) => (
    <div className="flex items-center space-x-2">
      {updatingField === field && (
        <Icons.spinner className="h-4 w-4 animate-spin" />
      )}
      <Badge
        variant={isVerified ? "default" : "destructive"}
        className={
          "cursor-pointer hover:opacity-80 transition-opacity " +
          (isVerified ? "bg-template" : "bg-destructive")
        }
        onClick={() =>
          handleVerification(field, isVerified ? "rejected" : "verified")
        }
      >
        {isVerified ? "Verified" : "Not Verified"}
      </Badge>
    </div>
  );

  // Fetch student IDs for navigation
  useEffect(() => {
    async function fetchStudentIds() {
      try {
        const { students } = await adminApi.getStudents({ perPage: 100 });
        const ids = students.map((s) => s._id);
        setStudentIds(ids);
        setCurrentIndex(ids.indexOf(studentId));
      } catch (err) {
        console.error("Failed to fetch student IDs:", err);
      }
    }

    fetchStudentIds();
  }, []);

  // Fetch student details
  useEffect(() => {
    async function fetchStudentDetails() {
      try {
        setLoading(true);
        setError(null);
        const studentData = await adminApi.getStudentById(studentId);
        console.log("[Frontend] Received student data:", studentData);
        console.log("[Frontend] Education data:", studentData.education);
        console.log("[Frontend] Positions data:", studentData.positions);
        console.log("[Frontend] Projects data:", studentData.projects);
        console.log("[Frontend] Experience data:", studentData.experience);
        setStudent(studentData);
      } catch (err) {
        console.error("[Frontend] Failed to fetch student details:", err);
        setError("Failed to load student details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  const navigateToStudent = (direction: "next" | "prev") => {
    if (!studentIds.length) return;

    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    // Handle wrapping around
    if (newIndex < 0) newIndex = studentIds.length - 1;
    if (newIndex >= studentIds.length) newIndex = 0;

    router.push(`/admin/verification/${studentIds[newIndex]}`);
  };

  const handleVerification = async (
    field: string,
    status: "verified" | "rejected"
  ) => {
    if (!student) return;

    try {
      setUpdatingField(field);
      console.log(
        `[Frontend] Making verification API call for field: ${field}, status: ${status}`
      );
      await adminApi.updateVerificationStatus(studentId, field, status);

      // Fetch the latest student data to ensure all fields are up to date
      const updatedStudent = await adminApi.getStudentById(studentId);
      setStudent(updatedStudent);
    } catch (err) {
      console.error(
        `[Frontend] Failed to update ${field} verification status:`,
        err
      );
    } finally {
      setUpdatingField(null);
    }
  };

  const handleVerifyAll = async () => {
    if (!student) return;

    try {
      setIsUpdating(true);

      // Verify all basic info fields
      const basicFields = [
        "name",
        "email",
        "phone",
        "date_of_birth",
        "gender",
        "address",
        "major",
        "student_id",
        "enrollment_year",
        "expected_graduation_year",
        "passport_image",
      ];

      for (const field of basicFields) {
        await adminApi.updateVerificationStatus(studentId, field, "verified");
      }

      // Verify all education items
      if (student.education) {
        for (let i = 0; i < student.education.length; i++) {
          await adminApi.updateVerificationStatus(
            studentId,
            `education.${i}`,
            "verified"
          );
        }
      }

      // Verify all experience items
      if (student.experience) {
        for (let i = 0; i < student.experience.length; i++) {
          await adminApi.updateVerificationStatus(
            studentId,
            `experience.${i}`,
            "verified"
          );
        }
      }

      // Verify all positions items
      if (student.positions) {
        for (let i = 0; i < student.positions.length; i++) {
          await adminApi.updateVerificationStatus(
            studentId,
            `positions.${i}`,
            "verified"
          );
        }
      }

      // Verify all projects items
      if (student.projects) {
        for (let i = 0; i < student.projects.length; i++) {
          await adminApi.updateVerificationStatus(
            studentId,
            `projects.${i}`,
            "verified"
          );
        }
      }

      // Fetch updated student data
      const updatedStudent = await adminApi.getStudentById(studentId);
      setStudent(updatedStudent);
    } catch (err) {
      console.error("Failed to verify all fields:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const isFullyVerified =
    student &&
    // Check basic info fields
    Object.entries(student.verification)
      .filter(
        ([key]) =>
          !["education", "experience", "positions", "projects"].includes(key)
      )
      .every(([_, value]) => value === "verified") &&
    // Check education items
    (student.education || []).every((edu) => edu.is_verified) &&
    // Check experience items
    (student.experience || []).every((exp) => exp.is_verified) &&
    // Check positions items
    (student.positions || []).every((pos) => pos.is_verified) &&
    // Check projects items
    (student.projects || []).every((proj) => proj.is_verified);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center text-destructive mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
        <Button onClick={() => router.push("/admin/verification")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students List
        </Button>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Student Not Found</h1>
        <Button onClick={() => router.push("/admin/verification")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students List
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/verification")}
          >
            <ArrowLeft className=" h-2 w-2" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-template py-4">
            Student Verification
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigateToStudent("prev")}
            disabled={studentIds.length <= 1 || isUpdating}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Previous Student</span>
          </Button>
          <span className="text-sm">
            {currentIndex + 1} of {studentIds.length}
          </span>
          <Button
            variant="outline"
            onClick={() => navigateToStudent("next")}
            disabled={studentIds.length <= 1 || isUpdating}
          >
            <ArrowRight className="h-4 w-4" />
            <span className="sr-only">Next Student</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-template">Student Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={student.passport_image} alt={student.name} />
                <AvatarFallback>
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h2 className="text-xl text-template font-bold">
                  {student.name}
                </h2>
                <p className="text-muted-foreground">{student.student_id}</p>
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch:</span>
                  <span className="font-medium">{student.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CGPA:</span>
                  <span className="font-medium">
                    {typeof student.cgpa === "number"
                      ? student.cgpa.toFixed(2)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Verification Status:
                  </span>
                  <Badge
                    variant={isFullyVerified ? "default" : "destructive"}
                    className="bg-template"
                  >
                    {isFullyVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <Tabs defaultValue="personal">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="academic">Academic Info</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="positions">Positions</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-template">
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <VerificationItem
                      label="Name"
                      value={student.name}
                      status={student.verification.name}
                      onVerify={() => handleVerification("name", "verified")}
                      onReject={() => handleVerification("name", "rejected")}
                      isUpdating={isUpdating}
                    />

                    <VerificationItem
                      label="Email"
                      value={student.email}
                      status={student.verification.email}
                      onVerify={() => handleVerification("email", "verified")}
                      onReject={() => handleVerification("email", "rejected")}
                      isUpdating={isUpdating}
                    />

                    <VerificationItem
                      label="Phone"
                      value={student.phone}
                      status={student.verification.phone}
                      onVerify={() => handleVerification("phone", "verified")}
                      onReject={() => handleVerification("phone", "rejected")}
                      isUpdating={isUpdating}
                    />

                    <VerificationItem
                      label="Date of Birth"
                      value={student.dateOfBirth}
                      status={student.verification.dateOfBirth || "pending"}
                      onVerify={() =>
                        handleVerification("date_of_birth", "verified")
                      }
                      onReject={() =>
                        handleVerification("date_of_birth", "rejected")
                      }
                      isUpdating={isUpdating}
                    />

                    <VerificationItem
                      label="Gender"
                      value={student.gender}
                      status={student.verification.gender}
                      onVerify={() => handleVerification("gender", "verified")}
                      onReject={() => handleVerification("gender", "rejected")}
                      isUpdating={isUpdating}
                    />

                    <VerificationItem
                      label="Address"
                      value={student.address}
                      status={student.verification.address}
                      onVerify={() => handleVerification("address", "verified")}
                      onReject={() => handleVerification("address", "rejected")}
                      isUpdating={isUpdating}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="academic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-template">
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <VerificationItem
                      label="Major"
                      value={student.major}
                      status={student.verification.major}
                      onVerify={() => handleVerification("major", "verified")}
                      onReject={() => handleVerification("major", "rejected")}
                      isUpdating={isUpdating}
                    />

                    <VerificationItem
                      label="Student ID"
                      value={student.studentId}
                      status={student.verification.studentId || "pending"}
                      onVerify={() =>
                        handleVerification("student_id", "verified")
                      }
                      onReject={() =>
                        handleVerification("student_id", "rejected")
                      }
                      isUpdating={isUpdating}
                    />

                    <VerificationItem
                      label="Enrollment Year"
                      value={student.enrollmentYear}
                      status={student.verification.enrollmentYear || "pending"}
                      onVerify={() =>
                        handleVerification("enrollment_year", "verified")
                      }
                      onReject={() =>
                        handleVerification("enrollment_year", "rejected")
                      }
                      isUpdating={isUpdating}
                    />

                    <VerificationItem
                      label="Expected Graduation Year"
                      value={student.expectedGraduationYear}
                      status={
                        student.verification.expectedGraduationYear || "pending"
                      }
                      onVerify={() =>
                        handleVerification(
                          "expected_graduation_year",
                          "verified"
                        )
                      }
                      onReject={() =>
                        handleVerification(
                          "expected_graduation_year",
                          "rejected"
                        )
                      }
                      isUpdating={isUpdating}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="education">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-template">
                      Education Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(student.education || []).map((edu, index) => (
                      <Card key={edu._id} className="mb-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <CardTitle className="text-lg">
                              {edu.education_details.institution
                                ?.current_value || "Education"}
                            </CardTitle>
                          </div>
                          {renderVerificationButton(
                            `education.${index}`,
                            edu.is_verified
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(edu.education_details)
                              .filter(([key]) => {
                                const allowedFields = [
                                  "gpa",
                                  "year",
                                  "major",
                                  "minor",
                                  "relevant_courses",
                                  "honors",
                                ];
                                return allowedFields.includes(key);
                              })
                              .map(([key, value]) => {
                                const verifiableValue = value as {
                                  current_value: string | null;
                                  last_verified_value: string | null;
                                };
                                if (!verifiableValue.current_value) return null;

                                return (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <div>
                                      <span className="text-muted-foreground capitalize">
                                        {key.replace(/_/g, " ")}:
                                      </span>
                                      <span className="ml-2">
                                        {verifiableValue.current_value}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="positions">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-template">
                      Positions of Responsibilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(student.positions || []).map((position, index) => (
                      <Card key={position._id} className="mb-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <CardTitle className="text-lg">
                              {position.position_details.title?.current_value ||
                                "Position"}
                            </CardTitle>
                          </div>
                          {renderVerificationButton(
                            `positions.${index}`,
                            position.is_verified
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(position.position_details).map(
                              ([key, value]) => {
                                const verifiableValue = value as {
                                  current_value: string | null;
                                  last_verified_value: string | null;
                                };
                                if (!verifiableValue.current_value) return null;
                                return (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <div>
                                      <span className="text-muted-foreground capitalize">
                                        {key.replace(/_/g, " ")}:
                                      </span>
                                      <span className="ml-2">
                                        {verifiableValue.current_value}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-template">
                      Projects Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(student.projects || []).map((project, index) => (
                      <Card key={project._id} className="mb-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <CardTitle className="text-lg">
                              {project.project_details.name?.current_value ||
                                "Project"}
                            </CardTitle>
                          </div>
                          {renderVerificationButton(
                            `projects.${index}`,
                            project.is_verified
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(project.project_details).map(
                              ([key, value]) => {
                                const verifiableValue = value as {
                                  current_value: string | null;
                                  last_verified_value: string | null;
                                };
                                if (!verifiableValue.current_value) return null;
                                return (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <div>
                                      <span className="text-muted-foreground capitalize">
                                        {key.replace(/_/g, " ")}:
                                      </span>
                                      <span className="ml-2">
                                        {verifiableValue.current_value}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-template">
                      Experience Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(student.experience || []).map((exp, index) => (
                      <Card key={exp._id} className="mb-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <CardTitle className="text-lg">
                              {exp.experience_details.position?.current_value ||
                                "Experience"}
                            </CardTitle>
                          </div>
                          {renderVerificationButton(
                            `experience.${index}`,
                            exp.is_verified
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(exp.experience_details).map(
                              ([key, value]) => {
                                const verifiableValue = value as {
                                  current_value: string | null;
                                  last_verified_value: string | null;
                                };
                                if (!verifiableValue.current_value) return null;
                                return (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between py-2"
                                  >
                                    <div>
                                      <span className="text-muted-foreground capitalize">
                                        {key.replace(/_/g, " ")}:
                                      </span>
                                      <span className="ml-2">
                                        {verifiableValue.current_value}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button
                className="w-full"
                disabled={isFullyVerified || isUpdating}
                onClick={handleVerifyAll}
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : isFullyVerified ? (
                  "Student Fully Verified"
                ) : (
                  "Verify All Fields"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
