"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Plus, Link, Trash2 } from "lucide-react"
import { useState } from "react"

export default function Projects() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "AI-Powered Chat Application",
      description: "Developed a real-time chat application with AI-powered features.",
      technologies: "React, Node.js, TensorFlow",
      link: "https://github.com/username/project",
      verified: true,
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#002147]">Projects</h1>
        <Button className="bg-[#002147] hover:bg-[#003167]">
          <Plus className="h-4 w-4 mr-1" />
          Add Project
        </Button>
      </div>

      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>{project.title}</CardTitle>
              {project.verified ? (
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
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input defaultValue={project.title} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea defaultValue={project.description} className="min-h-[100px]" />
            </div>

            <div className="space-y-2">
              <Label>Technologies Used</Label>
              <Input defaultValue={project.technologies} />
            </div>

            <div className="space-y-2">
              <Label>Project Link</Label>
              <div className="flex gap-2">
                <Input defaultValue={project.link} />
                <Button variant="outline" size="icon">
                  <Link className="h-4 w-4" />
                </Button>
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

