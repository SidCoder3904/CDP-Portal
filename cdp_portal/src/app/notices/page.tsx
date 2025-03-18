"use client"

import { Download, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Notice {
  _id: string;
  title: string;
  description?: string;
  link: string;
  date: string;
}

export default function NoticeList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notices`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch notices');
        }
        const data = await response.json();
        console.log('Fetched notices:', data); // Debug log
        setNotices(data.notices || []);
      } catch (error) {
        console.error('Error fetching notices:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load notices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const handleDownload = (notice: Notice) => {
    if (notice.link) {
      window.open(notice.link, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        Notices
      </h1>

      <div className="grid gap-4">
        {notices.map((notice) => (
          <Card key={notice._id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{notice.title}</p>
                  {notice.description && (
                    <p className="text-sm text-muted-foreground">{notice.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {new Date(notice.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Badge>
                    <Badge variant="destructive" className="text-xs">
                      PDF
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDownload(notice)}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download {notice.title}</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
