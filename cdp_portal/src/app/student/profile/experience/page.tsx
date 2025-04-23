"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, CheckCircle, Clock, Check, AlertCircle } from "lucide-react";
import { useStudentApi, Experience } from "@/lib/api/students";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  duration: z.string().min(1, "Duration is required"),
  description: z.string().optional(),
  technologies: z.string().optional(),
  achievements: z.string().optional(),
  skills: z.string().optional(),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

export default function ExperiencePage() {
  const [experienceData, setExperienceData] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentApi = useStudentApi();

  useEffect(() => {
    async function fetchExperienceData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await studentApi.getMyExperience();
        setExperienceData(data);
      } catch (error) {
        console.error("Failed to fetch experience data:", error);
        setError("Failed to load experience data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchExperienceData();
  }, []);

  const handleAdd = async (newData: ExperienceFormData) => {
    try {
      setIsUpdating(true);
      setError(null);

      const transformedData = {
        experience_details: {
          company: {
            current_value: newData.company,
            last_verified_value: null,
          },
          position: {
            current_value: newData.position,
            last_verified_value: null,
          },
          duration: {
            current_value: newData.duration,
            last_verified_value: null,
          },
          description: {
            current_value: newData.description ?? "",
            last_verified_value: null,
          },
          technologies: {
            current_value: newData.technologies ?? "",
            last_verified_value: null,
          },
          achievements: {
            current_value: newData.achievements ?? "",
            last_verified_value: null,
          },
          skills: {
            current_value: newData.skills ?? "",
            last_verified_value: null,
          },
        },
      };

      const addedExperience = await studentApi.addExperience(transformedData);
      setExperienceData([...experienceData, addedExperience]);
    } catch (error) {
      console.error("Failed to add experience:", error);
      setError("Failed to add experience. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (id: string, newData: ExperienceFormData) => {
    try {
      setIsUpdating(true);
      setError(null);

      const transformedData = {
        experience_details: {
          company: {
            current_value: newData.company,
            last_verified_value: null,
          },
          position: {
            current_value: newData.position,
            last_verified_value: null,
          },
          duration: {
            current_value: newData.duration,
            last_verified_value: null,
          },
          description: {
            current_value: newData.description ?? "",
            last_verified_value: null,
          },
          technologies: {
            current_value: newData.technologies ?? "",
            last_verified_value: null,
          },
          achievements: {
            current_value: newData.achievements ?? "",
            last_verified_value: null,
          },
          skills: {
            current_value: newData.skills ?? "",
            last_verified_value: null,
          },
        },
      };

      const updatedExperience = await studentApi.updateExperience(
        id,
        transformedData
      );
      setExperienceData(
        experienceData.map((exp) => (exp.id === id ? updatedExperience : exp))
      );
    } catch (error) {
      console.error("Failed to update experience:", error);
      setError("Failed to update experience. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      await studentApi.deleteExperience(id);
      setExperienceData(experienceData.filter((exp) => exp.id !== id));
    } catch (error) {
      console.error("Failed to delete experience:", error);
      setError("Failed to delete experience. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading experience data...</span>
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
      <h1 className="text-2xl text-template font-bold mb-6">Experience</h1>
      {experienceData.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-4">
            No experience records found. Add your first experience record.
          </p>
        </div>
      ) : (
        experienceData.map((exp) => (
          <Card key={exp.id} className="mb-6">
            <CardHeader>
              <CardTitle>
                {exp.experience_details.position.current_value} at{" "}
                {exp.experience_details.company.current_value}
              </CardTitle>
              <div className="flex items-center mt-1">
                {exp.is_verified ? (
                  <Badge variant="default" className="flex items-center">
                    <Check className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )}
                {exp.last_verified && (
                  <div className="text-sm text-muted-foreground ml-3">
                    on {new Date(exp.last_verified).toLocaleDateString()}
                  </div>
                )}
              </div>
              {exp.remark && (
                <div className="text-sm text-gray-600 mt-1">
                  Remark: {exp.remark}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  label="Company"
                  value={exp.experience_details.company.current_value}
                />
                <DetailItem
                  label="Position"
                  value={exp.experience_details.position.current_value}
                />
                <DetailItem
                  label="Duration"
                  value={exp.experience_details.duration.current_value}
                />
                <DetailItem
                  label="Description"
                  value={exp.experience_details.description.current_value}
                />
                <DetailItem
                  label="Technologies"
                  value={exp.experience_details.technologies.current_value}
                />
                <DetailItem
                  label="Achievements"
                  value={exp.experience_details.achievements.current_value}
                />
                <DetailItem
                  label="Skills"
                  value={exp.experience_details.skills.current_value}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <EditDialog
                  title="Update Experience"
                  fields={[
                    {
                      name: "company",
                      label: "Company",
                      type: "text",
                    },
                    {
                      name: "position",
                      label: "Position",
                      type: "text",
                    },
                    {
                      name: "duration",
                      label: "Duration",
                      type: "text",
                    },
                    {
                      name: "description",
                      label: "Description",
                      type: "text",
                    },
                    {
                      name: "technologies",
                      label: "Technologies",
                      type: "text",
                    },
                    {
                      name: "achievements",
                      label: "Achievements",
                      type: "text",
                    },
                    {
                      name: "skills",
                      label: "Skills",
                      type: "text",
                    },
                  ]}
                  initialData={{
                    company: exp.experience_details.company.current_value,
                    position: exp.experience_details.position.current_value,
                    duration: exp.experience_details.duration.current_value,
                    description: exp.experience_details.description.current_value,
                    technologies: exp.experience_details.technologies.current_value,
                    achievements: exp.experience_details.achievements.current_value,
                    skills: exp.experience_details.skills.current_value,
                  }}
                  zodSchema={experienceSchema}
                  onSaveValidated={(data) => handleUpdate(exp.id, data)}
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
                  onClick={() => handleDelete(exp.id)}
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
        title="Add Experience"
        fields={[
          {
            name: "company",
            label: "Company",
            type: "text",
          },
          {
            name: "position",
            label: "Position",
            type: "text",
          },
          {
            name: "duration",
            label: "Duration",
            type: "text",
          },
          {
            name: "description",
            label: "Description",
            type: "text",
          },
          {
            name: "technologies",
            label: "Technologies",
            type: "text",
          },
          {
            name: "achievements",
            label: "Achievements",
            type: "text",
          },
          {
            name: "skills",
            label: "Skills",
            type: "text",
          },
        ]}
        zodSchema={experienceSchema}
        onSaveValidated={handleAdd}
        triggerButton={
          <Button className="bg-template" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              "Add Experience"
            )}
          </Button>
        }
      />
    </div>
  );
}
