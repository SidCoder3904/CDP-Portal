"use client";

import type React from "react";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = "http://localhost:5000/api/notices"; // ✅ Fixed API URL

export function AddNoticeButton({ onNoticeAdded }: { onNoticeAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        BACKEND_URL,
        { title, content },
        {
          withCredentials: true, // ✅ Fix for auth cookies
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "Success",
        description: "Notice created successfully",
      });

      setTitle("");
      setContent("");
      setOpen(false);

      // ✅ Call parent function to refresh notices
      onNoticeAdded();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create notice",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-template hover:bg-[#003167]">
          <Plus className="mr-2 h-4 w-4" />
          Add Notice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Notice</DialogTitle>
            <DialogDescription>Create a new notice to inform students about placement activities.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notice title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter notice content"
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-template hover:bg-[#003167]" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Notice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
