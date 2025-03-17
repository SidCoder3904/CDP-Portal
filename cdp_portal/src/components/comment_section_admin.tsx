"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Comment {
  id: string
  notice_id: string
  notice_title: string
  user: string
  content: string
  created_at: string
  has_reply: boolean
  admin_reply?: string
  replied_by?: string
  replied_at?: string
}

export function CommentSectionAdmin() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [activeComment, setActiveComment] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchComments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch("/api/comments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await response.json()
      setComments(data.comments)
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

  useEffect(() => {
    fetchComments()
  }, [])

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`/api/comments/${commentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reply: replyContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to post reply")
      }

      // Refresh comments
      await fetchComments()
      setReplyContent("")
      setActiveComment(null)

      toast({
        title: "Success",
        description: "Your reply has been posted",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to post reply",
        variant: "destructive",
      })
    }
  }

  const pendingComments = comments.filter((comment) => !comment.has_reply)
  const answeredComments = comments.filter((comment) => comment.has_reply)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-template">Student Queries</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading comments...</div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="pending">Pending ({pendingComments.length})</TabsTrigger>
              <TabsTrigger value="answered">Answered ({answeredComments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {pendingComments.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No pending questions</div>
                  ) : (
                    pendingComments.map((comment) => (
                      <div key={comment.id} className="space-y-3">
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarFallback>{comment.user[0]}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{comment.user}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{comment.content}</p>
                            <div className="text-xs text-muted-foreground mt-1">Re: {comment.notice_title}</div>
                          </div>
                        </div>

                        {activeComment === comment.id ? (
                          <div className="ml-8 space-y-3">
                            <Textarea
                              placeholder="Type your reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="min-h-[100px]"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setActiveComment(null)
                                  setReplyContent("")
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="bg-template hover:bg-[#003167]"
                                onClick={() => handleReply(comment.id)}
                              >
                                Post Reply
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="ml-8">
                            <Button variant="outline" size="sm" onClick={() => setActiveComment(comment.id)}>
                              Reply
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="answered">
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {answeredComments.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No answered questions</div>
                  ) : (
                    answeredComments.map((comment) => (
                      <div key={comment.id} className="space-y-3">
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarFallback>{comment.user[0]}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{comment.user}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{comment.content}</p>
                            <div className="text-xs text-muted-foreground mt-1">Re: {comment.notice_title}</div>
                          </div>
                        </div>

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
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

