"use client";

import { useState, useEffect } from "react";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useStudentApi, Experience } from "@/lib/api/students";
import { Icons } from "@/components/icons";

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

  const handleAdd = async (newData: Partial<Experience>) => {
    try {
      setIsUpdating(true);
      setError(null);
      const addedExperience = await studentApi.addExperience(newData);
      setExperienceData([...experienceData, addedExperience]);
    } catch (error) {
      console.error("Failed to add experience:", error);
      setError("Failed to add experience. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (id: string, newData: Partial<Experience>) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedExperience = await studentApi.updateExperience(id, newData);
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
                {exp.position} at {exp.company}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  label="Company"
                  value={exp.company}
                  isVerified={exp.isVerified.company}
                />
                <DetailItem
                  label="Position"
                  value={exp.position}
                  isVerified={exp.isVerified.position}
                />
                <DetailItem
                  label="Duration"
                  value={exp.duration}
                  isVerified={exp.isVerified.duration}
                />
                <DetailItem
                  label="Description"
                  value={exp.description}
                  isVerified={exp.isVerified.description}
                />
                <DetailItem
                  label="Technologies"
                  value={exp.technologies}
                  isVerified={exp.isVerified.technologies}
                />
                <DetailItem
                  label="Achievements"
                  value={exp.achievements}
                  isVerified={exp.isVerified.achievements}
                />
                <DetailItem
                  label="Skills"
                  value={exp.skills}
                  isVerified={exp.isVerified.skills}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <EditDialog
                  title="Update Experience"
                  fields={[
                    { name: "company", label: "Company", type: "text" },
                    { name: "position", label: "Position", type: "text" },
                    { name: "duration", label: "Duration", type: "text" },
                    { name: "description", label: "Description", type: "text" },
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
                    { name: "skills", label: "Skills", type: "text" },
                  ]}
                  onSave={(data) => handleUpdate(exp.id, data)}
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
          { name: "company", label: "Company", type: "text" },
          { name: "position", label: "Position", type: "text" },
          { name: "duration", label: "Duration", type: "text" },
          { name: "description", label: "Description", type: "text" },
          { name: "technologies", label: "Technologies", type: "text" },
          { name: "achievements", label: "Achievements", type: "text" },
          { name: "skills", label: "Skills", type: "text" },
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
              "Add Experience"
            )}
          </Button>
        }
      />
    </div>
  );
}
