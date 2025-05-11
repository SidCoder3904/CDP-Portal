"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCommentApi, Comment } from "@/lib/api/comment"
import { useAuth } from "@/context/auth-context"

interface CommentSectionProps {
  placementCycleId: string
}

export function CommentSectionAdmin({ placementCycleId }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { getComments, createComment } = useCommentApi()

  const fetchComments = async () => {
    try {
      const data = await getComments(placementCycleId)
      console.log('Received comments data:', data)
      const validComments = data.filter((comment): comment is Comment => 
        comment !== null && 
        typeof comment === 'object' &&
        'content' in comment &&
        'user' in comment &&
        'created_at' in comment
      )
      setComments(validComments)
      setError(null)
    } catch (err) {
      console.error('Error fetching comments:', err)
      setError('Failed to fetch comments')
    }
  }

  useEffect(() => {
    fetchComments()
  }, [placementCycleId])

  const handlePostComment = async () => {
    if (!newComment.trim()) return

    try {
      await createComment({
        content: newComment.trim(),
        user: user?.name || 'Admin',
        user_type: 'admin',
        placement_cycle_id: placementCycleId
      })
      
      // Clear the input and refresh comments
      setNewComment("")
      await fetchComments()
      setError(null)
    } catch (err) {
      console.error('Error posting comment:', err)
      setError('Failed to post comment')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-template">Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <Textarea
            placeholder="Reply to queries here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button 
            onClick={handlePostComment}
            className="bg-template hover:bg-[#003167]"
          >
            Post Comment
          </Button>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-muted-foreground">No comments yet</div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {comment.user_type === 'admin' ? 'A' : 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {comment.user}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

