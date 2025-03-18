"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { PlusIcon } from "lucide-react"

const BACKEND_URL = "http://localhost:5000/api/notices/"

export function AddNoticeButton({ onNoticeAdded }: { onNoticeAdded: any }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [createdBy, setCreatedBy] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim() || !createdBy.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    try {
      await axios.post(
        BACKEND_URL,
        { title, content, created_by: createdBy },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      )

      toast.success("Notice created successfully")

      // Reset form and close dialog
      setTitle("")
      setContent("")
      setCreatedBy("")
      setOpen(false)
      onNoticeAdded()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create notice")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setCreatedBy("")
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-[#0a2463] hover:bg-[#0a2463]/90">
        <PlusIcon className="mr-2 h-4 w-4" /> Add Notice
      </Button>

      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) resetForm()
          setOpen(newOpen)
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Notice</DialogTitle>
            <DialogDescription>Create a new notice to inform students about placement activities.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Enter notice title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                placeholder="Enter notice content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="createdBy" className="text-sm font-medium">
                Created By
              </label>
              <Input
                id="createdBy"
                placeholder="Enter your name"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-[#0a2463] hover:bg-[#0a2463]/90">
                {isSubmitting ? "Creating..." : "Create Notice"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

