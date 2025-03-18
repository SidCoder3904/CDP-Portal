"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Building2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Notice {
  _id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function NoticeListAdmin() {
  if (typeof window === "undefined") return null;

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", created_by: "Admin" });
  const { toast } = useToast();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/notices/`, { withCredentials: true });
      setNotices(response.data.notices || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({ title: "Error", description: "Failed to load notices", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (noticeId: string) => {
    try {
      await axios.delete(`${backendUrl}/api/notices/${noticeId}`, { withCredentials: true });
      setNotices((prevNotices) => prevNotices.filter((notice) => notice._id !== noticeId));
      toast({ title: "Success", description: "Notice deleted successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete notice", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setNoticeToDelete(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading notices...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <Card key={notice._id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold text-template">{notice.title}</CardTitle>
              <Badge variant="secondary">Notice</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{notice.content}</p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                Posted by: {notice.created_by}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="destructive" size="sm" onClick={() => handleDelete(notice._id)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
