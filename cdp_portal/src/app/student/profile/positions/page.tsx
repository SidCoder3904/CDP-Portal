"use client";

import { useState } from "react";
import { DetailItem } from "@/components/detail-item";
import { Button } from "@/components/ui/button";
import { EditDialog } from "@/components/edit-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

// Placeholder data
const initialPositionsData = [
  {
    id: 1,
    title: "Student Council President",
    organization: "University of Technology",
    duration: "2022-2023",
    description:
      "Led student initiatives and represented student body in university meetings.",
    responsibilities: "Organized events, managed budget, liaised with faculty",
    achievements:
      "Increased student engagement by 30%, implemented new sustainability initiatives",
  },
  {
    id: 2,
    title: "Coding Club Lead",
    organization: "University of Technology",
    duration: "2021-2022",
    description:
      "Organized coding workshops and hackathons for fellow students.",
    responsibilities:
      "Planned weekly meetings, coordinated with guest speakers, managed club resources",
    achievements:
      "Doubled club membership, hosted successful hackathon with 100+ participants",
  },
];

export default function Positions() {
  const [positionsData, setPositionsData] = useState(initialPositionsData);

  const handleAdd = (newData: any) => {
    setPositionsData([...positionsData, { id: Date.now(), ...newData }]);
  };

  const handleUpdate = (id: number, newData: any) => {
    setPositionsData(
      positionsData.map((pos) => (pos.id === id ? { ...pos, ...newData } : pos))
    );
  };

  const handleDelete = (id: number) => {
    setPositionsData(positionsData.filter((pos) => pos.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl text-template font-bold mb-6">
        Positions of Responsibility
      </h1>
      {positionsData.map((position) => (
        <Card key={position.id} className="mb-6">
          <CardHeader>
            <CardTitle>{position.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem
                label="Organization"
                value={position.organization}
                isVerified={true}
              />
              <DetailItem
                label="Duration"
                value={position.duration}
                isVerified={true}
              />
              <DetailItem
                label="Description"
                value={position.description}
                isVerified={false}
              />
              <DetailItem
                label="Responsibilities"
                value={position.responsibilities}
                isVerified={true}
              />
              <DetailItem
                label="Achievements"
                value={position.achievements}
                isVerified={false}
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <EditDialog
                title="Update Position"
                fields={[
                  { name: "title", label: "Title", type: "text" },
                  { name: "organization", label: "Organization", type: "text" },
                  { name: "duration", label: "Duration", type: "text" },
                  { name: "description", label: "Description", type: "text" },
                  {
                    name: "responsibilities",
                    label: "Responsibilities",
                    type: "text",
                  },
                  { name: "achievements", label: "Achievements", type: "text" },
                ]}
                onSave={(data) => handleUpdate(position.id, data)}
                triggerButton={<Button variant="outline">Edit</Button>}
              />
              <Button
                variant="destructive"
                onClick={() => handleDelete(position.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <EditDialog
        title="Add Position"
        fields={[
          { name: "title", label: "Title", type: "text" },
          { name: "organization", label: "Organization", type: "text" },
          { name: "duration", label: "Duration", type: "text" },
          { name: "description", label: "Description", type: "text" },
          { name: "responsibilities", label: "Responsibilities", type: "text" },
          { name: "achievements", label: "Achievements", type: "text" },
        ]}
        onSave={handleAdd}
        triggerButton={<Button className="bg-template">Add Position</Button>}
      />
    </div>
  );
}
