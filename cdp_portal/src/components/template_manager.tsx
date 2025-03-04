"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Edit, Trash2, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TemplateBuilder } from "./template_builder"

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
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Basic Placement Report",
      description: "Standard placement report template with basic fields",
      columns: [
        { id: "name", header: "Student Name", type: "text", required: true },
        { id: "roll", header: "Roll Number", type: "text", required: true },
        { id: "company", header: "Company", type: "text", required: true },
        { id: "package", header: "Package (LPA)", type: "number", required: true },
      ],
    },
    {
      id: "2",
      name: "Internship Report",
      description: "Template for internship placement reporting",
      columns: [
        { id: "name", header: "Student Name", type: "text", required: true },
        { id: "company", header: "Company", type: "text", required: true },
        { id: "stipend", header: "Stipend", type: "number", required: true },
        { id: "duration", header: "Duration (months)", type: "number", required: true },
      ],
    },
  ])

  const [showBuilder, setShowBuilder] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  const handleSaveTemplate = (template: Template) => {
    if (editingTemplate) {
      setTemplates(templates.map((t) => (t.id === editingTemplate.id ? template : t)))
    } else {
      setTemplates([...templates, template])
    }
    setShowBuilder(false)
    setEditingTemplate(null)
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setShowBuilder(true)
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter((t) => t.id !== templateId))
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
            <TemplateBuilder onSave={handleSaveTemplate} />
          </DialogContent>
        </Dialog>
      </div>

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
    </div>
  )
}

