"use client";

import { useState, useEffect } from "react";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useStudentApi, Education } from "@/lib/api/students";
import { Icons } from "@/components/icons";

const degreeOptions = ["BTech", "MTech", "MSc", "High School Diploma"];
const majorOptions = ["CSE", "CE", "EE", "CBSE", "ICSE"];

export default function EducationPage() {
  const [educationData, setEducationData] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentApi = useStudentApi();

  useEffect(() => {
    async function fetchEducationData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await studentApi.getMyEducation();
        setEducationData(data);
      } catch (error) {
        console.error("Failed to fetch education data:", error);
        setError("Failed to load education data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEducationData();
  }, []);

  const handleAdd = async (newData: any) => {
    try {
      setIsUpdating(true);
      setError(null);

      // The backend API expects these fields directly
      const transformedData = {
        education_details: {
          degree: {
            current_value: newData.degree ?? "",
            last_verified_value: null,
          },
          institution: {
            current_value: newData.institution ?? "",
            last_verified_value: null,
          },
          year: {
            current_value: newData.year ?? "",
            last_verified_value: null,
          },
          gpa: {
            current_value: newData.gpa ?? "",
            last_verified_value: null,
          },
          major: {
            current_value: newData.major ?? "",
            last_verified_value: null,
          },
          minor: {
            current_value: newData.minor ?? "",
            last_verified_value: null,
          },
          relevant_courses: {
            current_value: newData.relevantCourses ?? "",
            last_verified_value: null,
          },
          honors: {
            current_value: newData.honors ?? "",
            last_verified_value: null,
          },
        },
      };

      const addedEducation = await studentApi.addEducation(transformedData);
      setEducationData([...educationData, addedEducation]);
    } catch (error) {
      console.error("Failed to add education:", error);
      setError("Failed to add education. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (id: string, newData: any) => {
    try {
      setIsUpdating(true);
      setError(null);

      // The backend API expects these fields directly
      const transformedData = {
        education_details: {
          degree: {
            current_value: newData.degree ?? "",
            last_verified_value: null,
          },
          institution: {
            current_value: newData.institution ?? "",
            last_verified_value: null,
          },
          year: {
            current_value: newData.year ?? "",
            last_verified_value: null,
          },
          gpa: {
            current_value: newData.gpa ?? "",
            last_verified_value: null,
          },
          major: {
            current_value: newData.major ?? "",
            last_verified_value: null,
          },
          minor: {
            current_value: newData.minor ?? "",
            last_verified_value: null,
          },
          relevant_courses: {
            current_value: newData.relevantCourses ?? "",
            last_verified_value: null,
          },
          honors: {
            current_value: newData.honors ?? "",
            last_verified_value: null,
          },
        },
      };

      const updatedEducation = await studentApi.updateEducation(
        id,
        transformedData
      );
      setEducationData(
        educationData.map((edu) => (edu.id === id ? updatedEducation : edu))
      );
    } catch (error) {
      console.error("Failed to update education:", error);
      setError("Failed to update education. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      await studentApi.deleteEducation(id);
      setEducationData(educationData.filter((edu) => edu.id !== id));
    } catch (error) {
      console.error("Failed to delete education:", error);
      setError("Failed to delete education. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading education data...</span>
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
      <h1 className="text-2xl text-template font-bold mb-6">
        Education/Academic
      </h1>
      {educationData.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-4">
            No education records found. Add your first education record.
          </p>
        </div>
      ) : (
        educationData.map((edu) => (
          <Card key={edu.id} className="mb-6">
            <CardHeader>
              <CardTitle>
                {edu.education_details.degree.current_value}
              </CardTitle>
              {edu.is_verified && (
                <div className="text-sm text-green-600">
                  Verified on:{" "}
                  {new Date(edu.last_verified || "").toLocaleDateString()}
                </div>
              )}
              {edu.remark && (
                <div className="text-sm text-gray-600">
                  Remark: {edu.remark}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  label="Institution"
                  value={edu.education_details.institution.current_value}
                  status={edu.is_verified ? "verified" : "pending"}
                />
                <DetailItem
                  label="Year"
                  value={edu.education_details.year.current_value}
                  status={edu.is_verified ? "verified" : "pending"}
                />
                <DetailItem
                  label="GPA"
                  value={edu.education_details.gpa.current_value}
                  status={edu.is_verified ? "verified" : "pending"}
                />
                <DetailItem
                  label="Major"
                  value={edu.education_details.major.current_value}
                  status={edu.is_verified ? "verified" : "pending"}
                />
                <DetailItem
                  label="Minor"
                  value={edu.education_details.minor.current_value}
                  status={edu.is_verified ? "verified" : "pending"}
                />
                <DetailItem
                  label="Relevant Courses"
                  value={edu.education_details.relevant_courses.current_value}
                  status={edu.is_verified ? "verified" : "pending"}
                />
                <DetailItem
                  label="Honors"
                  value={edu.education_details.honors.current_value}
                  status={edu.is_verified ? "verified" : "pending"}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <EditDialog
                  title="Update Education"
                  fields={[
                    {
                      name: "degree",
                      label: "Degree",
                      type: "select",
                      options: degreeOptions,
                    },
                    {
                      name: "institution",
                      label: "Institution",
                      type: "text",
                    },
                    {
                      name: "year",
                      label: "Year",
                      type: "text",
                    },
                    {
                      name: "gpa",
                      label: "GPA",
                      type: "text",
                    },
                    {
                      name: "major",
                      label: "Major",
                      type: "select",
                      options: majorOptions,
                    },
                    {
                      name: "minor",
                      label: "Minor",
                      type: "text",
                    },
                    {
                      name: "relevantCourses",
                      label: "Relevant Courses",
                      type: "text",
                    },
                    {
                      name: "honors",
                      label: "Honors",
                      type: "text",
                    },
                  ]}
                  onSave={(data) => handleUpdate(edu.id, data)}
                  triggerButton={
                    <Button variant="outline" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        "Edit"
                      )}
                    </Button>
                  }
                />
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(edu.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <EditDialog
        title="Add Education"
        fields={[
          {
            name: "degree",
            label: "Degree",
            type: "select",
            options: degreeOptions,
          },
          { name: "institution", label: "Institution", type: "text" },
          { name: "year", label: "Year", type: "text" },
          { name: "gpa", label: "GPA", type: "text" },
          {
            name: "major",
            label: "Major",
            type: "select",
            options: majorOptions,
          },
          { name: "minor", label: "Minor", type: "text" },
          { name: "relevantCourses", label: "Relevant Courses", type: "text" },
          { name: "honors", label: "Honors", type: "text" },
        ]}
        onSave={handleAdd}
        triggerButton={
          <Button className="bg-template" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              "Add Education"
            )}
          </Button>
        }
      />
    </div>
  );
}
