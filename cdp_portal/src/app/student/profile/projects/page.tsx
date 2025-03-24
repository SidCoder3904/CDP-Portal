"use client";

import { useState, useEffect } from "react";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from 'lucide-react';
import { useStudentApi, Project } from "@/lib/api/students";
import { Icons } from "@/components/icons";

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

  const handleAdd = async (newData: Partial<Project>) => {
    try {
      setIsUpdating(true);
      setError(null);
      const addedProject = await studentApi.addProject(newData);
      setProjectsData([...projectsData, addedProject]);
    } catch (error) {
      console.error("Failed to add project:", error);
      setError("Failed to add project. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (id: string, newData: Partial<Project>) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedProject = await studentApi.updateProject(id, newData);
      setProjectsData(
        projectsData.map((proj) => (proj.id === id ? updatedProject : proj))
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
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
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
          <p className="text-gray-500 mb-4">No projects found. Add your first project.</p>
        </div>
      ) : (
        projectsData.map((project) => (
          <Card key={project.id} className="mb-6">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailItem
                  label="Description"
                  value={project.description}
                  isVerified={project.isVerified.description}
                />
                <DetailItem
                  label="Technologies"
                  value={project.technologies}
                  isVerified={project.isVerified.technologies}
                />
                <DetailItem
                  label="Duration"
                  value={project.duration}
                  isVerified={project.isVerified.duration}
                />
                <DetailItem
                  label="Role"
                  value={project.role}
                  isVerified={project.isVerified.role}
                />
                <DetailItem
                  label="Team Size"
                  value={project.teamSize}
                  isVerified={project.isVerified.teamSize}
                />
                <DetailItem
                  label="GitHub"
                  value={
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {project.githubLink}
                    </a>
                  }
                  isVerified={project.isVerified.githubLink}
                />
                <DetailItem
                  label="Demo"
                  value={
                    <a
                      href={project.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {project.demoLink}
                    </a>
                  }
                  isVerified={project.isVerified.demoLink}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <EditDialog
                  title="Update Project"
                  fields={[
                    { name: "name", label: "Name", type: "text" },
                    { name: "description", label: "Description", type: "text" },
                    { name: "technologies", label: "Technologies", type: "text" },
                    { name: "duration", label: "Duration", type: "text" },
                    { name: "role", label: "Role", type: "text" },
                    { name: "teamSize", label: "Team Size", type: "number" },
                    { name: "githubLink", label: "GitHub Link", type: "url" },
                    { name: "demoLink", label: "Demo Link", type: "url" },
                  ]}
                  onSave={(data) => handleUpdate(project.id, data)}
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
          { name: "name", label: "Name", type: "text" },
          { name: "description", label: "Description", type: "text" },
          { name: "technologies", label: "Technologies", type: "text" },
          { name: "duration", label: "Duration", type: "text" },
          { name: "role", label: "Role", type: "text" },
          { name: "teamSize", label: "Team Size", type: "number" },
          { name: "githubLink", label: "GitHub Link", type: "url" },
          { name: "demoLink", label: "Demo Link", type: "url" },
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
              "Add Project"
            )}
          </Button>
        }
      />
    </div>
  );
}