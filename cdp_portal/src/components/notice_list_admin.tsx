"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Building2, Pencil, Trash2, PlusCircle } from "lucide-react";
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
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const thebackendurl = "http://localhost:5000/api/notices";

export function NoticeListAdmin() {
  if (typeof window === "undefined") return null; // Prevent hydration error

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", created_by: "Admin" });
  const { toast } = useToast();

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(thebackendurl);
      setNotices(response.data.notices || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load notices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (noticeId: string) => {
    try {
      await axios.delete(`${thebackendurl}/${noticeId}`);
      setNotices((prevNotices) => prevNotices.filter((notice) => notice.id !== noticeId));
      toast({
        title: "Success",
        description: "Notice deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete notice",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setNoticeToDelete(null);
    }
  };

  const confirmDelete = (noticeId: string) => {
    setNoticeToDelete(noticeId);
    setDeleteDialogOpen(true);
  };

  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" });
      return;
    }
    try {
      const response = await axios.post(thebackendurl, newNotice);
      setNotices((prevNotices) => [response.data.notice, ...prevNotices]);
      setNewNotice({ title: "", content: "", created_by: "Admin" });
      toast({ title: "Success", description: "Notice created successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to create notice", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading notices...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2">Create New Notice</h2>
          <Input
            placeholder="Title"
            value={newNotice.title}
            onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
            className="mb-2"
          />
          <Textarea
            placeholder="Content"
            value={newNotice.content}
            onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
            className="mb-2"
          />
          <Button onClick={handleCreateNotice} className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" /> Create Notice
          </Button>
        </div>

        {notices.map((notice) => (
          <Card key={notice.id}>
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
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => confirmDelete(notice.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
