"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Comment {
  id: number
  user: string
  content: string
  timestamp: string
}

export function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: "Samarth Jain",
      content: "When will the exact schedule for the Tech Giants recruitment drive be announced?",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      user: "Akash Verma",
      content: "Is the resume workshop mandatory for internship applicants as well?",
      timestamp: "1 hour ago",
    },
  ])
  const [newComment, setNewComment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment: Comment = {
      id: comments.length + 1,
      user: "Student",
      content: newComment,
      timestamp: "Just now",
    }

    setComments([...comments, comment])
    setNewComment("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-template">Student Queries</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] mb-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar>
                  <AvatarFallback>{comment.user[0]}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.user}</span>
                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Ask your question here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" className="bg-template hover:bg-[#003167]">
            Post Question
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

