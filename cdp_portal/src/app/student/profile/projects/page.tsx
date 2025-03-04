"use client";

import { useState } from "react";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

// Placeholder data
const initialProjectsData = [
  {
    id: 1,
    name: "AI-powered Chatbot",
    description:
      "Developed a chatbot using natural language processing techniques.",
    technologies: "Python, TensorFlow, Flask",
    duration: "Jan 2023 - Apr 2023",
    role: "Lead Developer",
    teamSize: "3",
    githubLink: "https://github.com/johndoe/ai-chatbot",
    demoLink: "https://ai-chatbot-demo.herokuapp.com",
  },
  {
    id: 2,
    name: "E-commerce Website",
    description:
      "Built a full-stack e-commerce website with user authentication and payment integration.",
    technologies: "React, Node.js, MongoDB, Stripe",
    duration: "Sep 2022 - Dec 2022",
    role: "Full-stack Developer",
    teamSize: "4",
    githubLink: "https://github.com/johndoe/ecommerce-site",
    demoLink: "https://ecommerce-demo.netlify.app",
  },
];

export default function Projects() {
  const [projectsData, setProjectsData] = useState(initialProjectsData);

  const handleAdd = (newData: any) => {
    setProjectsData([...projectsData, { id: Date.now(), ...newData }]);
  };

  const handleUpdate = (id: number, newData: any) => {
    setProjectsData(
      projectsData.map((proj) =>
        proj.id === id ? { ...proj, ...newData } : proj
      )
    );
  };

  const handleDelete = (id: number) => {
    setProjectsData(projectsData.filter((proj) => proj.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl text-template font-bold mb-6">Projects</h1>
      {projectsData.map((project) => (
        <Card key={project.id} className="mb-6">
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem
                label="Description"
                value={project.description}
                isVerified={false}
              />
              <DetailItem
                label="Technologies"
                value={project.technologies}
                isVerified={true}
              />
              <DetailItem
                label="Duration"
                value={project.duration}
                isVerified={true}
              />
              <DetailItem
                label="Role"
                value={project.role}
                isVerified={false}
              />
              <DetailItem
                label="Team Size"
                value={project.teamSize}
                isVerified={true}
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
                isVerified={true}
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
                isVerified={false}
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
                triggerButton={<Button variant="outline">Edit</Button>}
              />
              <Button
                variant="destructive"
                onClick={() => handleDelete(project.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
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
        triggerButton={<Button className="bg-template">Add Project</Button>}
      />
    </div>
  );
}
