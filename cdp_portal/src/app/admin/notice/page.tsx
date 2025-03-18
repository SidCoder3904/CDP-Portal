"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Download, FileText, Calendar, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toaster, toast } from "sonner"

interface Notice {
  _id: string
  title: string
  description?: string
  link: string
  type: "pdf"  // Required by backend, but always "pdf"
  date: string
}

export default function AdminNotices() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentNotice, setCurrentNotice] = useState<Notice | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Omit<Notice, "_id">>({
    title: "",
    description: "",
    link: "",
    type: "pdf",
    date: new Date().toISOString().split("T")[0],
  })

  // Fetch notices
  const fetchNotices = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notices`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch notices')
      }
      const data = await response.json()
      setNotices(data.notices || [])
    } catch (error) {
      console.error('Error fetching notices:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load notices')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [])

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
      type: "pdf",
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

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/notices/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      console.log("Data", data)
      setFormData(prev => ({ ...prev, link: data.url }))
      toast.success('File uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  // Save notice (add or edit)
  const handleSaveNotice = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }

    if (!formData.link) {
      toast.error("Please upload a file first")
      return
    }

    try {
      // Get the token from cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      // if (!token) {
      //   toast.error("Please login to continue")
      //   return
      // }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      console.log('API URL:', apiUrl)

      const url = isEditing && currentNotice
        ? `${apiUrl}/api/notices/${currentNotice._id}`
        : `${apiUrl}/api/notices`
      
      console.log('Request URL:', url)

      const method = isEditing ? 'PUT' : 'POST'
      const requestBody = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        link: formData.link,
        type: "pdf",
        date: formData.date,
      }

      console.log('Request body:', JSON.stringify(requestBody, null, 2))
      console.log(method)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })

      console.log('Response status:', response.status)
      // console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      let responseData
      try {
        const responseText = await response.text()
        console.log('Raw response:', responseText)
        responseData = JSON.parse(responseText)
        console.log('Parsed response data:', responseData)
      } catch (e) {
        console.error('Error parsing response:', e)
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please login again")
          return
        }
        if (response.status === 422) {
          console.error('Validation error:', responseData)
          let errorMessage = 'Validation failed: '
          if (responseData.errors) {
            errorMessage += Object.entries(responseData.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join(', ')
          } else if (responseData.error) {
            errorMessage += responseData.error
          } else {
            errorMessage += 'Please check your input'
          }
          throw new Error(errorMessage)
        }
        throw new Error(responseData.error || `Server error: ${response.status}`)
      }

      await fetchNotices()
      toast.success(`Notice ${isEditing ? 'updated' : 'added'} successfully`)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving notice:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save notice')
    }
  }

  // Delete notice
  const handleDeleteNotice = async () => {
    if (!currentNotice) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notices/${currentNotice._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete notice')
      }

      await fetchNotices()
      toast.success("Notice deleted successfully")
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting notice:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete notice')
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
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
          <Card key={notice._id} className="group">
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
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditNotice(notice)}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit {notice?.title ?? "Notice"}</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(notice)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Delete {notice?.title ?? "Notice"}</span>
                </Button>
                {notice.link && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={async () => {
                      try {
                        // Fetch the PDF file
                        const response = await fetch(notice.link);
                        if (!response.ok) throw new Error('Failed to fetch PDF');
                        
                        // Get the blob
                        const blob = await response.blob();
                        
                        // Create a blob URL
                        const blobUrl = window.URL.createObjectURL(blob);
                        
                        // Create a temporary link
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `${notice.title || 'notice'}.pdf`; // Set download filename
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        
                        // Append to body, click, and cleanup
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                      } catch (error) {
                        console.error('Error downloading PDF:', error);
                        toast.error('Failed to download PDF');
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download {notice?.title ?? "Notice"}</span>
                  </Button>
                )}
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
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Upload PDF File</Label>
              <div className="flex gap-2">
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {isUploading && <div className="animate-spin">⌛</div>}
              </div>
              {formData.link && (
                <p className="text-sm text-muted-foreground">
                  Current file: {formData.link}
                </p>
              )}
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
            <p className="font-medium mt-2">{currentNotice?.title ?? "Unnamed Notice"}</p>
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

      <Toaster />
    </div>
  )
}
