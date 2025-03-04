"use client";

import { useState } from "react";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

// Placeholder data
const initialEducationData = [
  {
    id: 1,
    degree: "Bachelor of Science in Computer Science",
    institution: "University of Technology",
    year: "2020-2024",
    gpa: "3.8",
    major: "Computer Science",
    minor: "Data Science",
    relevantCourses:
      "Algorithms, Data Structures, Machine Learning, Database Systems",
    honors: "Dean's List (2020-2023)",
  },
  {
    id: 2,
    degree: "High School Diploma",
    institution: "City High School",
    year: "2016-2020",
    gpa: "3.9",
    major: "General Studies",
    minor: "N/A",
    relevantCourses: "Advanced Mathematics, Physics, Computer Science",
    honors: "Valedictorian",
  },
];

export default function Education() {
  const [educationData, setEducationData] = useState(initialEducationData);

  const handleAdd = (newData: any) => {
    setEducationData([...educationData, { id: Date.now(), ...newData }]);
  };

  const handleUpdate = (id: number, newData: any) => {
    setEducationData(
      educationData.map((edu) => (edu.id === id ? { ...edu, ...newData } : edu))
    );
  };

  const handleDelete = (id: number) => {
    setEducationData(educationData.filter((edu) => edu.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl text-template font-bold mb-6">
        Education/Academic
      </h1>
      {educationData.map((edu) => (
        <Card key={edu.id} className="mb-6">
          <CardHeader>
            <CardTitle>{edu.degree}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem
                label="Institution"
                value={edu.institution}
                isVerified={true}
              />
              <DetailItem label="Year" value={edu.year} isVerified={true} />
              <DetailItem label="GPA" value={edu.gpa} isVerified={false} />
              <DetailItem label="Major" value={edu.major} isVerified={true} />
              <DetailItem label="Minor" value={edu.minor} isVerified={true} />
              <DetailItem
                label="Relevant Courses"
                value={edu.relevantCourses}
                isVerified={false}
              />
              <DetailItem label="Honors" value={edu.honors} isVerified={true} />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <EditDialog
                title="Update Education"
                fields={[
                  { name: "degree", label: "Degree", type: "text" },
                  { name: "institution", label: "Institution", type: "text" },
                  { name: "year", label: "Year", type: "text" },
                  { name: "gpa", label: "GPA", type: "text" },
                  { name: "major", label: "Major", type: "text" },
                  { name: "minor", label: "Minor", type: "text" },
                  {
                    name: "relevantCourses",
                    label: "Relevant Courses",
                    type: "text",
                  },
                  { name: "honors", label: "Honors", type: "text" },
                ]}
                onSave={(data) => handleUpdate(edu.id, data)}
                triggerButton={<Button variant="outline">Edit</Button>}
              />
              <Button
                variant="destructive"
                onClick={() => handleDelete(edu.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <EditDialog
        title="Add Education"
        fields={[
          { name: "degree", label: "Degree", type: "text" },
          { name: "institution", label: "Institution", type: "text" },
          { name: "year", label: "Year", type: "text" },
          { name: "gpa", label: "GPA", type: "text" },
          { name: "major", label: "Major", type: "text" },
          { name: "minor", label: "Minor", type: "text" },
          { name: "relevantCourses", label: "Relevant Courses", type: "text" },
          { name: "honors", label: "Honors", type: "text" },
        ]}
        onSave={handleAdd}
        triggerButton={<Button className="bg-template">Add Education</Button>}
      />
    </div>
  );
}
