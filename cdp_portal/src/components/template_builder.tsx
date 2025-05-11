"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd"
import { GripVertical, X, Save, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Column {
  id: string
  header: string
  type: string
  required: boolean
  formula?: string
}

interface Template {
  id: string
  name: string
  description: string
  columns: Column[]
}

const availableFields = [
  { id: "name", label: "Student Name", type: "text" },
  { id: "roll", label: "Roll Number", type: "text" },
  { id: "branch", label: "Branch", type: "select" },
  { id: "cgpa", label: "CGPA", type: "number" },
  { id: "company", label: "Company", type: "text" },
  { id: "role", label: "Role", type: "text" },
  { id: "package", label: "Package", type: "number" },
  { id: "status", label: "Status", type: "select" },
  { id: "joining_date", label: "Joining Date", type: "date" },
  { id: "offer_date", label: "Offer Date", type: "date" },
]

export function TemplateBuilder({ onSave }: { onSave: (template: Template) => void }) {
  const [template, setTemplate] = useState<Template>({
    id: "",
    name: "",
    description: "",
    columns: [],
  })

  const [showFormulaField, setShowFormulaField] = useState<string | null>(null)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(template.columns)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTemplate({ ...template, columns: items })
  }

  const addColumn = (field: (typeof availableFields)[0]) => {
    const newColumn: Column = {
      id: field.id,
      header: field.label,
      type: field.type,
      required: false,
    }
    setTemplate({ ...template, columns: [...template.columns, newColumn] })
  }

  const removeColumn = (index: number) => {
    const newColumns = template.columns.filter((_, i) => i !== index)
    setTemplate({ ...template, columns: newColumns })
  }

  const toggleRequired = (index: number) => {
    const newColumns = [...template.columns]
    newColumns[index].required = !newColumns[index].required
    setTemplate({ ...template, columns: newColumns })
  }

  const updateFormula = (index: number, formula: string) => {
    const newColumns = [...template.columns]
    newColumns[index].formula = formula
    setTemplate({ ...template, columns: newColumns })
  }

  const handleSave = () => {
    if (!template.name) return
    onSave({ ...template, id: crypto.randomUUID() })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              placeholder="Enter template name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="templateDescription">Description</Label>
            <Textarea
              id="templateDescription"
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              placeholder="Enter template description"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableFields.map((field) => (
              <Button key={field.id} variant="outline" className="justify-start" onClick={() => addColumn(field)}>
                <Plus className="h-4 w-4 mr-2" />
                {field.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {template.columns.map((column, index) => (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                        >
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="h-5 w-5" />
                          </div>
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Input value={column.header} readOnly />
                            <Select
                              value={column.type}
                              onValueChange={(value) => {
                                const newColumns = [...template.columns]
                                newColumns[index].type = value
                                setTemplate({ ...template, columns: newColumns })
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="formula">Formula</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`required-${index}`}
                                checked={column.required}
                                onCheckedChange={() => toggleRequired(index)}
                              />
                              <Label htmlFor={`required-${index}`}>Required</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              {column.type === "formula" && (
                                <Button variant="outline" size="sm" onClick={() => setShowFormulaField(column.id)}>
                                  Edit Formula
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeColumn(index)}
                                className="ml-auto"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {showFormulaField && (
            <div className="mt-4 p-4 border rounded-lg">
              <Label>Formula</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={template.columns.find((col) => col.id === showFormulaField)?.formula || ""}
                  onChange={(e) => {
                    const index = template.columns.findIndex((col) => col.id === showFormulaField)
                    updateFormula(index, e.target.value)
                  }}
                  placeholder="Enter formula (e.g., {package} * 0.3)"
                />
                <Button variant="outline" onClick={() => setShowFormulaField(null)}>
                  Done
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Use {"{columnName}"} to reference other columns in your formula
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!template.name}>
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>
    </div>
  )
}

