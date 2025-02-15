"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Upload, FileText, Download, Eye, Trash2 } from "lucide-react"
import { useState } from "react"

interface Document {
  id: number
  name: string
  type: "resume" | "certificate"
  date: string
  verified: boolean
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      name: "Resume_v2.pdf",
      type: "resume",
      date: "Updated 2 days ago",
      verified: true,
    },
    {
      id: 2,
      name: "AWS_Certification.pdf",
      type: "certificate",
      date: "Added 1 week ago",
      verified: true,
    },
    {
      id: 3,
      name: "Google_Cloud_Certificate.pdf",
      type: "certificate",
      date: "Added 2 weeks ago",
      verified: false,
    },
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#002147]">Resume & Certificates</h1>

      <Card>
        <CardHeader>
          <CardTitle>Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            <Button variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
            <p className="text-sm text-muted-foreground mt-2">PDF files up to 5MB</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Certificates</CardTitle>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-1" />
              Add Certificate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-[#002147]" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc.verified ? (
                    <Badge variant="outline" className="bg-green-50">
                      <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50">
                      <XCircle className="mr-1 h-3 w-3 text-red-500" />
                      Pending
                    </Badge>
                  )}

                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

