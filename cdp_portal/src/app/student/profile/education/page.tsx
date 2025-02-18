"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Upload, Plus } from "lucide-react"
import { useState } from "react"

export default function Education() {
  const [educationHistory, setEducationHistory] = useState([
    {
      id: 1,
      level: "Class XII",
      school: "Delhi Public School",
      board: "CBSE",
      year: "2021",
      percentage: "95.6%",
      verified: true,
    },
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#002147]">Education Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Academic Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Current CGPA</Label>
              <Input value="9.45" disabled />
            </div>
            <div className="space-y-2">
              <Label>Current Semester</Label>
              <Input value="6th" disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Semester-wise Performance</Label>
            <div className="grid gap-2 md:grid-cols-3">
              {[
                { sem: "1st", sgpa: "9.2" },
                { sem: "2nd", sgpa: "9.4" },
                { sem: "3rd", sgpa: "9.5" },
                { sem: "4th", sgpa: "9.6" },
                { sem: "5th", sgpa: "9.5" },
              ].map((sem) => (
                <div key={sem.sem} className="flex items-center justify-between p-2 border rounded">
                  <span>Sem {sem.sem}</span>
                  <span className="font-medium">{sem.sgpa}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Previous Education</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {educationHistory.map((edu) => (
            <div key={edu.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{edu.level}</h3>
                {edu.verified ? (
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>School/Institution</Label>
                  <Input defaultValue={edu.school} />
                </div>
                <div className="space-y-2">
                  <Label>Board</Label>
                  <Input defaultValue={edu.board} />
                </div>
                <div className="space-y-2">
                  <Label>Year of Completion</Label>
                  <Input defaultValue={edu.year} />
                </div>
                <div className="space-y-2">
                  <Label>Percentage/CGPA</Label>
                  <Input defaultValue={edu.percentage} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Marksheet</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">PDF or image files up to 5MB</p>
                </div>
              </div>

              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

