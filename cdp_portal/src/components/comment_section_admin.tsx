"use client"

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
  adminReply?: string
}

export function CommentSectionAdmin() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: "Student",
      content: "When will the exact schedule for the Tech Giants recruitment drive be announced?",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      user: "Student",
      content: "Is the resume workshop mandatory for internship applicants as well?",
      timestamp: "1 hour ago",
    },
  ])
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({})

  const handleReply = (commentId: number) => {
    const updatedComments = comments.map((comment) =>
      comment.id === commentId ? { ...comment, adminReply: replyContent[commentId] } : comment,
    )
    setComments(updatedComments)
    setReplyContent({ ...replyContent, [commentId]: "" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#002147]">Student Queries</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <div className="flex gap-3">
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
                {comment.adminReply && (
                  <div className="flex gap-3 ml-8">
                    <Avatar>
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Admin</span>
                        <span className="text-xs text-muted-foreground">Just now</span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.adminReply}</p>
                    </div>
                  </div>
                )}
                {!comment.adminReply && (
                  <div className="ml-8 space-y-2">
                    <Textarea
                      placeholder="Reply to this query..."
                      value={replyContent[comment.id] || ""}
                      onChange={(e) => setReplyContent({ ...replyContent, [comment.id]: e.target.value })}
                    />
                    <Button onClick={() => handleReply(comment.id)} className="bg-[#002147] hover:bg-[#003167]">
                      Post Reply
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

