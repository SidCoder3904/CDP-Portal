"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Upload, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

export default function Experience() {
  const [experiences, setExperiences] = useState([
    {
      id: 1,
      role: "Software Engineering Intern",
      company: "Tech Corp",
      duration: "May 2023 - July 2023",
      description: "Worked on developing new features for the company's main product.",
      verified: true,
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#002147]">Experience</h1>
        <Button className="bg-[#002147] hover:bg-[#003167]">
          <Plus className="h-4 w-4 mr-1" />
          Add Experience
        </Button>
      </div>

      {experiences.map((exp) => (
        <Card key={exp.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>{exp.role}</CardTitle>
              {exp.verified ? (
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50">
                  <XCircle className="mr-1 h-3 w-3 text-red-500" />
                  Pending Verification
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input defaultValue={exp.company} />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input defaultValue={exp.duration} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea defaultValue={exp.description} className="min-h-[100px]" />
            </div>

            <div className="space-y-2">
              <Label>Offer Letter/Completion Certificate</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <p className="text-sm text-muted-foreground mt-2">PDF or image files up to 5MB</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button className="bg-[#002147] hover:bg-[#003167]">Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

