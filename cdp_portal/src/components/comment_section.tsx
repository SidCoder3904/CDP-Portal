"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: string
  user: string
  content: string
  created_at: string
  has_reply: boolean
  admin_reply?: string
  replied_by?: string
  replied_at?: string
}

export function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null)
  const [notices, setNotices] = useState<{ id: string; title: string }[]>([])
  const { toast } = useToast()

  // Create an Axios instance with baseURL
  const axiosInstance = axios.create({
    baseURL: "/api",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  })

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Authentication required")

        const response = await axiosInstance.get("/notices")
        const noticesList = response.data.notices.map((notice: any) => ({
          id: notice.id,
          title: notice.title,
        }))

        setNotices(noticesList)
        if (noticesList.length > 0) setSelectedNoticeId(noticesList[0].id)
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load notices",
          variant: "destructive",
        })
      }
    }

    fetchNotices()
  }, [toast])

  useEffect(() => {
    if (selectedNoticeId) {
      const fetchComments = async () => {
        setLoading(true)
        try {
          const response = await axiosInstance.get(`/comments/notice/${selectedNoticeId}`)
          setComments(response.data.comments)
        } catch (err) {
          toast({
            title: "Error",
            description: err instanceof Error ? err.message : "Failed to load comments",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }

      fetchComments()
    }
  }, [selectedNoticeId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !selectedNoticeId) return

    try {
      await axiosInstance.post("/comments", {
        notice_id: selectedNoticeId,
        content: newComment,
      })

      // Refresh comments
      const response = await axiosInstance.get(`/comments/notice/${selectedNoticeId}`)
      setComments(response.data.comments)
      setNewComment("")

      toast({ title: "Success", description: "Your question has been posted" })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to post comment",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-template">Student Queries</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading comments...</div>
        ) : (
          <>
            <ScrollArea className="h-[300px] mb-4">
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No questions yet. Be the first to ask!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarFallback>{comment.user[0]}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.user}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{comment.content}</p>
                        </div>
                      </div>

                      {comment.has_reply && (
                        <div className="flex gap-3 ml-8 bg-muted p-3 rounded-md">
                          <Avatar>
                            <AvatarFallback>{comment.replied_by?.[0] || "A"}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{comment.replied_by || "Admin"}</span>
                              <span className="text-xs text-muted-foreground">
                                {comment.replied_at
                                  ? formatDistanceToNow(new Date(comment.replied_at), { addSuffix: true })
                                  : ""}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{comment.admin_reply}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
