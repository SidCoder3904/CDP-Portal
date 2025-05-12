"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, CheckCircle, Clock, Check, AlertCircle } from "lucide-react";
import { useStudentApi, Project } from "@/lib/api/students";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  technologies: z.string().optional(),
  duration: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.coerce
    .number()
    .int()
    .min(1, "Team size must be at least 1")
    .optional()
    .or(z.literal("")),
  githubLink: z.string().url("Invalid URL format").optional().or(z.literal("")),
  demoLink: z.string().url("Invalid URL format").optional().or(z.literal("")),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentApi = useStudentApi();

  useEffect(() => {
    async function fetchProjectsData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await studentApi.getMyProjects();
        setProjectsData(data);
      } catch (error) {
        console.error("Failed to fetch projects data:", error);
        setError("Failed to load projects data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjectsData();
  }, []);

  const handleAdd = async (newData: ProjectFormData) => {
    try {
      setIsUpdating(true);
      setError(null);

      const transformedData = {
        project_details: {
          name: {
            current_value: newData.name,
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
          duration: {
            current_value: newData.duration ?? "",
            last_verified_value: null,
          },
          role: {
            current_value: newData.role ?? "",
            last_verified_value: null,
          },
          teamSize: {
            current_value: String(newData.teamSize ?? ""),
            last_verified_value: null,
          },
          githubLink: {
            current_value: newData.githubLink ?? "",
            last_verified_value: null,
          },
          demoLink: {
            current_value: newData.demoLink ?? "",
            last_verified_value: null,
          },
        },
      };

      const addedProject = await studentApi.addProject(transformedData);
      setProjectsData([...projectsData, addedProject]);
    } catch (error) {
      console.error("Failed to add project:", error);
      setError("Failed to add project. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (id: string, newData: ProjectFormData) => {
    try {
      setIsUpdating(true);
      setError(null);

      const transformedData = {
        project_details: {
          name: {
            current_value: newData.name,
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
          duration: {
            current_value: newData.duration ?? "",
            last_verified_value: null,
          },
          role: {
            current_value: newData.role ?? "",
            last_verified_value: null,
          },
          teamSize: {
            current_value: String(newData.teamSize ?? ""),
            last_verified_value: null,
          },
          githubLink: {
            current_value: newData.githubLink ?? "",
            last_verified_value: null,
          },
          demoLink: {
            current_value: newData.demoLink ?? "",
            last_verified_value: null,
          },
        },
      };

      const updatedProject = await studentApi.updateProject(
        id,
        transformedData
      );
      setProjectsData(
        projectsData.map((project) =>
          project.id === id ? updatedProject : project
        )
      );
    } catch (error) {
      console.error("Failed to update project:", error);
      setError("Failed to update project. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      await studentApi.deleteProject(id);
      setProjectsData(projectsData.filter((proj) => proj.id !== id));
    } catch (error) {
      console.error("Failed to delete project:", error);
      setError("Failed to delete project. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading projects data...</span>
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
      <h1 className="text-2xl text-template font-bold mb-6">Projects</h1>
      {projectsData.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-4">
            No projects found. Add your first project.
          </p>
        </div>
      ) : (
        projectsData.map((project) => (
          <Card key={project.id} className="mb-6">
            <CardHeader>
              <CardTitle>
                {project.project_details.name.current_value}
              </CardTitle>
              <div className="flex items-center mt-1">
                {project.is_verified ? (
                  <Badge
                    variant="default"
                    className="flex items-center bg-template text-white"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )}
                {project.last_verified && (
                  <div className="text-sm text-muted-foreground ml-3">
                    on {new Date(project.last_verified).toLocaleDateString()}
                  </div>
                )}
              </div>
              {project.remark && (
                <div className="text-sm text-gray-600 mt-1">
                  Remark: {project.remark}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  label="Description"
                  value={project.project_details.description.current_value}
                />
                <DetailItem
                  label="Technologies"
                  value={project.project_details.technologies.current_value}
                />
                <DetailItem
                  label="Duration"
                  value={project.project_details.duration.current_value}
                />
                <DetailItem
                  label="Role"
                  value={project.project_details.role.current_value}
                />
                <DetailItem
                  label="Team Size"
                  value={project.project_details.teamSize.current_value}
                />
                <DetailItem
                  label="GitHub"
                  value={project.project_details.githubLink.current_value}
                />
                <DetailItem
                  label="Demo"
                  value={project.project_details.demoLink.current_value}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <EditDialog
                  title="Update Project"
                  fields={[
                    {
                      name: "name",
                      label: "Name",
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
                      name: "duration",
                      label: "Duration",
                      type: "text",
                    },
                    {
                      name: "role",
                      label: "Role",
                      type: "text",
                    },
                    {
                      name: "teamSize",
                      label: "Team Size",
                      type: "number",
                    },
                    {
                      name: "githubLink",
                      label: "GitHub Link",
                      type: "url",
                    },
                    {
                      name: "demoLink",
                      label: "Demo Link",
                      type: "url",
                    },
                  ]}
                  initialData={{
                    name: project.project_details.name.current_value,
                    description:
                      project.project_details.description.current_value,
                    technologies:
                      project.project_details.technologies.current_value,
                    duration: project.project_details.duration.current_value,
                    role: project.project_details.role.current_value,
                    teamSize: project.project_details.teamSize.current_value,
                    githubLink:
                      project.project_details.githubLink.current_value,
                    demoLink: project.project_details.demoLink.current_value,
                  }}
                  zodSchema={projectSchema}
                  onSaveValidated={(data) => handleUpdate(project.id, data)}
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
                  onClick={() => handleDelete(project.id)}
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
        title="Add Project"
        fields={[
          {
            name: "name",
            label: "Name",
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
            name: "duration",
            label: "Duration",
            type: "text",
          },
          {
            name: "role",
            label: "Role",
            type: "text",
          },
          {
            name: "teamSize",
            label: "Team Size",
            type: "number",
          },
          {
            name: "githubLink",
            label: "GitHub Link",
            type: "url",
          },
          {
            name: "demoLink",
            label: "Demo Link",
            type: "url",
          },
        ]}
        zodSchema={projectSchema}
        onSaveValidated={handleAdd}
        triggerButton={
          <Button className="bg-template" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              "Add Project"
            )}
          </Button>
        }
      />
    </div>
  );
}
