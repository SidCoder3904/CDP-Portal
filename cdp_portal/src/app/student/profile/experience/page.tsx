"use client";

import { useState } from "react";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

// Placeholder data
const initialExperienceData = [
  {
    id: 1,
    company: "Tech Innovators Inc.",
    position: "Software Engineering Intern",
    duration: "June 2023 - August 2023",
    description:
      "Worked on developing new features for the company's main product.",
    technologies: "React, Node.js, MongoDB",
    achievements:
      "Implemented a new feature that increased user engagement by 15%",
    skills: "Full-stack development, Agile methodologies, Git",
  },
  {
    id: 2,
    company: "Data Analytics Co.",
    position: "Data Science Intern",
    duration: "May 2022 - July 2022",
    description: "Assisted in data analysis and visualization projects.",
    technologies: "Python, Pandas, Matplotlib, Scikit-learn",
    achievements:
      "Developed a predictive model with 90% accuracy for customer churn",
    skills: "Data analysis, Machine learning, Data visualization",
  },
];

export default function Experience() {
  const [experienceData, setExperienceData] = useState(initialExperienceData);

  const handleAdd = (newData: any) => {
    setExperienceData([...experienceData, { id: Date.now(), ...newData }]);
  };

  const handleUpdate = (id: number, newData: any) => {
    setExperienceData(
      experienceData.map((exp) =>
        exp.id === id ? { ...exp, ...newData } : exp
      )
    );
  };

  const handleDelete = (id: number) => {
    setExperienceData(experienceData.filter((exp) => exp.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl text-template font-bold mb-6">Experience</h1>
      {experienceData.map((exp) => (
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
                isVerified={true}
              />
              <DetailItem
                label="Position"
                value={exp.position}
                isVerified={true}
              />
              <DetailItem
                label="Duration"
                value={exp.duration}
                isVerified={true}
              />
              <DetailItem
                label="Description"
                value={exp.description}
                isVerified={false}
              />
              <DetailItem
                label="Technologies"
                value={exp.technologies}
                isVerified={true}
              />
              <DetailItem
                label="Achievements"
                value={exp.achievements}
                isVerified={false}
              />
              <DetailItem label="Skills" value={exp.skills} isVerified={true} />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <EditDialog
                title="Update Experience"
                fields={[
                  { name: "company", label: "Company", type: "text" },
                  { name: "position", label: "Position", type: "text" },
                  { name: "duration", label: "Duration", type: "text" },
                  { name: "description", label: "Description", type: "text" },
                  { name: "technologies", label: "Technologies", type: "text" },
                  { name: "achievements", label: "Achievements", type: "text" },
                  { name: "skills", label: "Skills", type: "text" },
                ]}
                onSave={(data) => handleUpdate(exp.id, data)}
                triggerButton={<Button variant="outline">Edit</Button>}
              />
              <Button
                variant="destructive"
                onClick={() => handleDelete(exp.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
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
        triggerButton={<Button className="bg-template">Add Experience</Button>}
      />
    </div>
  );
}
