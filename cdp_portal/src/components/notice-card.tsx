"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Pencil,
  Trash2,
  CalendarDays,
  Building2,
  GraduationCap,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export interface Comment {
  _id?: string
  noticeId: string
  userId: string
  content: string
  createdAt?: Date
  user?: {
    name: string
    role: string
  }
}

export interface Notice {
  _id?: string
  title: string
  date: string
  company: string
  type: string
  content: string
  createdAt?: Date
  updatedAt?: Date
  placementCycleId?: string
}

interface NoticeCardProps {
  notice: Notice
  comments: Comment[]
  isAdmin?: boolean
  onAddComment: (noticeId: string, content: string) => void
  onDeleteNotice?: (id: string) => void
  onEditNotice?: (id: string) => void
}

export function NoticeCard({
  notice,
  comments,
  isAdmin = false,
  onAddComment,
  onDeleteNotice,
  onEditNotice,
}: NoticeCardProps) {
  const [newComment, setNewComment] = useState("")
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

  const noticeComments = comments.filter((comment) => comment.noticeId === notice._id)

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    onAddComment(notice._id!, newComment)
    setNewComment("")
  }

  return (
    <Card className="mb-6 border-l-4 border-l-template">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-template">{notice.title}</CardTitle>
          <Badge variant="secondary">{notice.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{notice.content}</p>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {notice.date}
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            {notice.company}
          </div>
          <div className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            For: {notice.type === "Internship" ? "Pre-final Year" : "Final Year"}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {noticeComments.length} comments
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onEditNotice && onEditNotice(notice._id!)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              onClick={() => onDeleteNotice && onDeleteNotice(notice._id!)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col">
        <Collapsible open={isCommentsOpen} onOpenChange={setIsCommentsOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-between w-full mb-2">
              <span>Comments</span>
              {isCommentsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-4 mb-4">
              {noticeComments.length > 0 ? (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {noticeComments.map((comment) => (
                      <div key={comment._id} className="flex gap-3">
                        <Avatar>
                          <AvatarFallback>{comment.user?.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.user?.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.user?.role === "admin" ? "Admin" : "Student"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
              )}
            </div>

            <form onSubmit={handleSubmitComment} className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button type="submit" className="bg-template hover:bg-[#003167]">
                Post Comment
              </Button>
            </form>
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  )
}
