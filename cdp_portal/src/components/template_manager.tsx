"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Edit, Trash2, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TemplateBuilder } from "./template_builder"
import { useApi } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface Template {
  id?: string
  _id?: string
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

  // Fetch templates from backend when component mounts
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true)
      try {
        const response = await fetchWithAuth("/api/reports/templates")
        if (response.ok) {
          const data = await response.json()
          // Normalize template IDs (backend might use _id)
          const normalizedTemplates = data.map((template: any) => ({
            id: template.id || template._id,
            ...template,
          }))
          setTemplates(normalizedTemplates)
        } else {
          toast({
            title: "Error fetching templates",
            description: "Failed to load report templates",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching templates:", error)
        toast({
          title: "Error",
          description: "Failed to connect to server",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleSaveTemplate = async (template: Template) => {
    try {
      let response
      
      if (editingTemplate) {
        // Update existing template
        const templateId = editingTemplate.id || editingTemplate._id
        response = await fetchWithAuth(`/api/reports/templates/${templateId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(template),
        })
      } else {
        // Create new template
        response = await fetchWithAuth("/api/reports/templates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(template),
        })
      }

      if (response.ok) {
        const savedTemplate = await response.json()
        
        if (editingTemplate) {
          // Update templates list with edited template
          setTemplates(templates.map((t) => 
            (t.id === savedTemplate.id || t._id === savedTemplate._id) ? 
              { ...savedTemplate, id: savedTemplate.id || savedTemplate._id } : t
          ))
          toast({
            title: "Template updated",
            description: "Report template has been updated successfully",
          })
        } else {
          // Add new template to list
          setTemplates([...templates, { ...savedTemplate, id: savedTemplate.id || savedTemplate._id }])
          toast({
            title: "Template created",
            description: "New report template has been created",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to save template",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
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
        method: "DELETE",
      })

      if (response.ok) {
        setTemplates(templates.filter((t) => t.id !== templateId && t._id !== templateId))
        toast({
          title: "Template deleted",
          description: "Report template has been deleted",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete template",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    }
  }

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      // Create a copy of the template with a new name
      const newTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        // Remove id so backend treats it as a new template
        id: undefined,
        _id: undefined
      }

      const response = await fetchWithAuth("/api/reports/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTemplate),
      })

      if (response.ok) {
        const savedTemplate = await response.json()
        setTemplates([...templates, { ...savedTemplate, id: savedTemplate.id || savedTemplate._id }])
        toast({
          title: "Template duplicated",
          description: "Report template has been duplicated",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to duplicate template",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error duplicating template:", error)
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    }
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
            <TemplateBuilder 
              onSave={handleSaveTemplate} 
              initialTemplate={editingTemplate || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No templates found</p>
          <Button 
            className="bg-template hover:bg-[#003167]"
            onClick={() => setShowBuilder(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id || template._id}>
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
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id || template._id || "")}>
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

