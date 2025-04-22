"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Edit, Trash2, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TemplateBuilder } from "./template_builder"
import { useApi } from "@/lib/api"

interface Template {
  id: string
  name: string
  description: string
  columns: Array<{
    id: string
    header: string
    type: string
    required: boolean
    formula?: string
  }>
}

export function TemplateManager() {
  const { fetchWithAuth } = useApi()
  const [templates, setTemplates] = useState<Template[]>([])
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch templates from backend
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true)
        const response = await fetchWithAuth('/api/reports/templates')
        if (response.ok) {
          const data = await response.json()
          setTemplates(data.map((template: any) => ({
            id: template.id || template._id,
            name: template.name,
            description: template.description,
            columns: template.columns
          })))
        } else {
          console.error("Failed to fetch templates")
          // Set default templates if fetch fails
          setTemplates([
            {
              id: "1",
              name: "Placement Summary",
              description: "Summary of placements for a specific cycle",
              columns: [
                { id: "studentId", header: "Student ID", type: "text", required: true },
                { id: "studentName", header: "Student Name", type: "text", required: true },
                { id: "email", header: "Email", type: "text", required: true },
                { id: "major", header: "Major/Branch", type: "text", required: true },
                { id: "company", header: "Company", type: "text", required: true },
                { id: "role", header: "Role", type: "text", required: true },
                { id: "package", header: "Package", type: "text", required: true },
                { id: "status", header: "Status", type: "text", required: true },
              ],
            },
            {
              id: "2",
              name: "Student Placement Status",
              description: "Detailed status of each student's placement",
              columns: [
                { id: "studentId", header: "Student ID", type: "text", required: true },
                { id: "studentName", header: "Student Name", type: "text", required: true },
                { id: "email", header: "Email", type: "text", required: true },
                { id: "major", header: "Major/Branch", type: "text", required: true },
                { id: "placementStatus", header: "Placement Status", type: "text", required: true },
                { id: "totalApplications", header: "Total Applications", type: "number", required: true },
                { id: "bestOfferCompany", header: "Best Offer Company", type: "text", required: false },
                { id: "bestOfferPackage", header: "Best Offer Package", type: "text", required: false },
              ],
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [fetchWithAuth])

  const handleSaveTemplate = async (template: Template) => {
    try {
      if (editingTemplate) {
        // Update existing template
        const response = await fetchWithAuth(`/api/reports/templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(template)
        })

        if (response.ok) {
          setTemplates(templates.map((t) => (t.id === editingTemplate.id ? template : t)))
        } else {
          console.error("Failed to update template")
        }
      } else {
        // Create new template
        const response = await fetchWithAuth('/api/reports/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(template)
        })

        if (response.ok) {
          const data = await response.json()
          setTemplates([...templates, { ...template, id: data.id || data._id }])
        } else {
          console.error("Failed to create template")
        }
      }
    } catch (error) {
      console.error("Error saving template:", error)
    }
    
    setShowBuilder(false)
    setEditingTemplate(null)
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setShowBuilder(true)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetchWithAuth(`/api/reports/templates/${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTemplates(templates.filter((t) => t.id !== templateId))
      } else {
        console.error("Failed to delete template")
      }
    } catch (error) {
      console.error("Error deleting template:", error)
    }
  }

  const handleDuplicateTemplate = (template: Template) => {
    const newTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
    }
    setTemplates([...templates, newTemplate])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-template">Report Templates</h2>
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogTrigger asChild>
            <Button className="bg-template hover:bg-[#003167]">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</DialogTitle>
            </DialogHeader>
            <TemplateBuilder initialTemplate={editingTemplate} onSave={handleSaveTemplate} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">Loading templates...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-lg">{template.name}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDuplicateTemplate(template)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(template)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                <ScrollArea className="h-[100px]">
                  <div className="space-y-1">
                    {template.columns.map((column) => (
                      <div key={column.id} className="text-sm flex items-center gap-2">
                        <span className="font-medium">{column.header}</span>
                        <span className="text-muted-foreground">({column.type})</span>
                        {column.required && <span className="text-xs text-red-500">Required</span>}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

