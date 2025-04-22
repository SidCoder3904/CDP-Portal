"use client"

import type React from "react"

import { useState } from "react"
import { Download, FileText, Calendar, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface Notice {
  id: string
  title: string
  description?: string
  link: string
  type: "pdf" | "view"
  date: string
}

export default function AdminNotices() {
  // Initial notices data
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: "1",
      title: "Academic Calendar February 2025 to July 2025 for B.Sc-B.Ed 2024 batch",
      description: "Calendar for the upcoming semester",
      link: "#",
      type: "view",
      date: "2025-02-01",
    },
    {
      id: "2",
      title: "Academic Calendar 2nd semester of AY 2024-25 and 1st semester of AY 2025-26",
      description: "Calendar for both semesters",
      link: "#",
      type: "view",
      date: "2024-12-15",
    },
    {
      id: "3",
      title: "Academic Calendar September 2024 to January 2025 for B.Sc-B.Ed 2024 batch",
      description: "Calendar for the first semester",
      link: "#",
      type: "pdf",
      date: "2024-09-01",
    },
  ])

  // State for add/edit dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentNotice, setCurrentNotice] = useState<Notice | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Omit<Notice, "id">>({
    title: "",
    description: "",
    link: "",
    type: "view",
    date: new Date().toISOString().split("T")[0],
  })

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Open add notice dialog
  const handleAddNotice = () => {
    setIsEditing(false)
    setFormData({
      title: "",
      description: "",
      link: "",
      type: "view",
      date: new Date().toISOString().split("T")[0],
    })
    setIsDialogOpen(true)
  }

  // Open edit notice dialog
  const handleEditNotice = (notice: Notice) => {
    setIsEditing(true)
    setCurrentNotice(notice)
    setFormData({
      title: notice.title,
      description: notice.description || "",
      link: notice.link,
      type: notice.type,
      date: notice.date,
    })
    setIsDialogOpen(true)
  }

  // Open delete confirmation dialog
  const handleDeleteClick = (notice: Notice) => {
    setCurrentNotice(notice)
    setIsDeleteDialogOpen(true)
  }

  // Save notice (add or edit)
  const handleSaveNotice = () => {
    if (!formData.title.trim()) {
      return
    }

    if (isEditing && currentNotice) {
      // Update existing notice
      setNotices(notices.map((notice) => (notice.id === currentNotice.id ? { ...notice, ...formData } : notice)))
    } else {
      // Add new notice
      const newNotice: Notice = {
        id: Date.now().toString(),
        ...formData,
      }
      setNotices([newNotice, ...notices])
    }

    setIsDialogOpen(false)
  }

  // Delete notice
  const handleDeleteNotice = () => {
    if (currentNotice) {
      setNotices(notices.filter((notice) => notice.id !== currentNotice.id))
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Manage Notices
        </h1>
        <Button onClick={handleAddNotice} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Notice
        </Button>
      </div>

      <div className="grid gap-4">
        {notices.map((notice) => (
          <Card key={notice.id} className="group">
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{notice.title}</p>
                  {notice.description && <p className="text-sm text-muted-foreground">{notice.description}</p>}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {new Date(notice.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Badge>
                    <Badge variant={notice.type === "pdf" ? "destructive" : "default"} className="text-xs">
                      {notice.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditNotice(notice)}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit {notice.title}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(notice)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Delete {notice.title}</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download {notice.title}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Notice Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Notice" : "Add New Notice"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter notice title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a brief description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange(value, "type")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">VIEW</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link">File Link</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="Enter file link or upload path"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveNotice}>
              {isEditing ? "Update" : "Add"} Notice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this notice?</p>
            <p className="font-medium mt-2">{currentNotice?.title}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" type="button" onClick={handleDeleteNotice}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  
    </div>
  )
}

