"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Notice {
  _id: string;
  title: string;
  description?: string;
  link: string;
  content: string;
  company: string;
  type: "placement" | "internship" | "workshop";
  date: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export default function AdminNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentNotice, setCurrentNotice] = useState<Notice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [useTestApi, setUseTestApi] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<Notice, "_id">>({
    title: "",
    description: "",
    link: "",
    content: "",
    company: "General",
    type: "placement",
    date: new Date().toISOString().split("T")[0],
  });

  // Parse notices data from different API response formats
  const parseNoticesResponse = (data: any): Notice[] => {
    if (!data) return [];

    // Handle array format
    if (Array.isArray(data)) {
      return data.map((notice: any, index: number) => ({
        _id: notice._id || notice.id || `temp-id-${index}`,
        title: notice.title || "Untitled Notice",
        description: notice.description || "",
        link: notice.link || "",
        content: notice.content || notice.description || "",
        company: notice.company || "General",
        type: (notice.type as any) || "placement",
        date: notice.date || new Date().toISOString().split("T")[0],
        created_at: notice.created_at,
        updated_at: notice.updated_at,
        created_by: notice.created_by,
      }));
    }

    // Handle {notices: [...]} format
    if (data.notices && Array.isArray(data.notices)) {
      return data.notices.map((notice: any, index: number) => ({
        _id: notice._id || notice.id || `temp-id-${index}`,
        title: notice.title || "Untitled Notice",
        description: notice.description || "",
        link: notice.link || "",
        content: notice.content || notice.description || "",
        company: notice.company || "General",
        type: (notice.type as any) || "placement",
        date: notice.date || new Date().toISOString().split("T")[0],
        created_at: notice.created_at,
        updated_at: notice.updated_at,
        created_by: notice.created_by,
      }));
    }

    return [];
  };

  // Fetch notices
  const fetchNotices = async () => {
    setIsLoading(true);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem("access_token");

      if (useTestApi) {
        // Use local test data
        console.log("Using test notices data");

        // Hardcoded test notices data instead of making API call
        const testData = [
          {
            _id: "test-id-1",
            title: "Test Placement Notice 1",
            description: "This is a test placement notice",
            link: "https://example.com/test1.pdf",
            content: "Test placement notice content",
            company: "Test Company A",
            type: "placement",
            date: new Date().toISOString().split("T")[0],
          },
          {
            _id: "test-id-2",
            title: "Test Internship Notice 2",
            description: "This is a test internship notice",
            link: "https://example.com/test2.pdf",
            content: "Test internship notice content",
            company: "Test Company B",
            type: "internship",
            date: new Date().toISOString().split("T")[0],
          },
          {
            _id: "test-id-3",
            title: "Test Workshop Notice 3",
            description: "This is a test workshop notice",
            link: "https://example.com/test3.pdf",
            content: "Test workshop notice content",
            company: "Test Company C",
            type: "workshop",
            date: new Date().toISOString().split("T")[0],
          },
        ];

        console.log("Test notices loaded:", testData.length);
        setNotices(parseNoticesResponse(testData));
        return;
      }

      // Use the original fetch from backend approach
      console.log("Fetching notices from backend");

      if (!token) {
        console.warn("No token available, unable to fetch notices");
        setNotices([]);
        toast.error("You need to be logged in to view notices");
        return;
      }

      // Try multiple API endpoints sequentially until one works
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      console.log("Backend URL:", backendUrl);

      // List of possible endpoints to try
      const endpointsToTry = [
        `/notice/notices`, // Original endpoint
        `/api/notice/notices`, // Alternative with /api prefix
        `/notice`, // Shorter endpoint
        `/notices`, // Direct endpoint
        `/api/notices`, // Another common pattern
      ];

      let successful = false;

      for (const endpoint of endpointsToTry) {
        if (successful) break; // Skip remaining endpoints if one worked

        try {
          console.log(`Trying endpoint: ${backendUrl}${endpoint}`);

          const response = await fetch(`${backendUrl}${endpoint}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            console.log(`Successful response from: ${backendUrl}${endpoint}`);
            const data = await response.json();
            console.log(
              "Notices loaded from backend:",
              data?.notices?.length || 0
            );
            setNotices(parseNoticesResponse(data));
            successful = true;
            return; // Exit the function once we get a successful response
          } else {
            console.log(
              `Endpoint ${backendUrl}${endpoint} returned status ${response.status}`
            );
          }
        } catch (endpointError) {
          console.error(`Error with endpoint ${endpoint}:`, endpointError);
        }
      }

      // If we get here, all endpoints failed
      throw new Error("All API endpoints returned errors");
    } catch (error) {
      console.error("Error fetching from backend:", error);

      // If backend fetch fails, use hardcoded test data as fallback
      console.log("Falling back to test notices");
      setUseTestApi(true);

      // Hardcoded test notices data
      const testData = [
        {
          _id: "fallback-id-1",
          title: "Fallback Placement Notice 1",
          description: "This is a fallback placement notice",
          link: "https://example.com/fallback1.pdf",
          content: "Fallback placement notice content",
          company: "Fallback Company A",
          type: "placement",
          date: new Date().toISOString().split("T")[0],
        },
        {
          _id: "fallback-id-2",
          title: "Fallback Internship Notice 2",
          description: "This is a fallback internship notice",
          link: "https://example.com/fallback2.pdf",
          content: "Fallback internship notice content",
          company: "Fallback Company B",
          type: "internship",
          date: new Date().toISOString().split("T")[0],
        },
      ];

      console.log("Test notices loaded as fallback:", testData.length);
      setNotices(parseNoticesResponse(testData));

      toast.warning("Using test notices due to backend error");
    } finally {
      setIsLoading(false);
    }
  };

  // Diagnostic function to debug API issues
  const runDiagnostics = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("You need to be logged in to run diagnostics");
        return;
      }

      toast.info("Running API diagnostics...");

      // Test the backend connection directly
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${backendUrl}/notice/notices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const statusCode = response.status;
        const isJson =
          response.headers.get("content-type")?.includes("application/json") ||
          false;

        console.log("API Diagnostics:", {
          status: statusCode,
          isJson,
          success: response.ok,
        });

        if (response.ok) {
          toast.success("Backend connection successful");
        } else {
          toast.error(`Backend response status: ${statusCode}`);
        }

        if (!isJson) {
          toast.warning("Backend is not returning valid JSON");
        }
      } catch (error) {
        console.error("Backend connection error:", error);
        toast.error(
          error instanceof Error
            ? `Backend connection error: ${error.message}`
            : "Failed to connect to backend"
        );
      }
    } catch (error) {
      console.error("Diagnostics error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to run diagnostics"
      );
    }
  };

  // Run on component mount
  useEffect(() => {
    fetchNotices().catch((error) => {
      console.error("Initial fetch notices error:", error);
      toast.error("Error loading notices. Try using the diagnostic tools.");
    });
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open add notice dialog
  const handleAddNotice = () => {
    setIsEditing(false);
    setFormData({
      title: "",
      description: "",
      link: "",
      content: "",
      company: "General",
      type: "placement",
      date: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  };

  // Open edit notice dialog
  const handleEditNotice = (notice: Notice) => {
    setIsEditing(true);
    setCurrentNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description || "",
      link: notice.link,
      content: notice.content,
      company: notice.company,
      type: notice.type,
      date: notice.date,
    });
    setIsDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (notice: Notice) => {
    setCurrentNotice(notice);
    setIsDeleteDialogOpen(true);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("You are not logged in. Please log in to upload files.");
        return;
      }

      // Multiple upload endpoint patterns to try
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const possibleEndpoints = [
        `/notice/upload`,
        `/notices/upload`,
        `/api/notice/upload`,
        `/api/notices/upload`,
        `/upload`,
      ];

      let successful = false;

      for (const endpoint of possibleEndpoints) {
        if (successful) break;

        try {
          const fullUrl = `${backendUrl}${endpoint}`;
          console.log("Attempting upload to:", fullUrl);

          const response = await fetch(fullUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (response.ok) {
            console.log(`Success with upload endpoint: ${endpoint}`);
            successful = true;

            const uploadData = await response.json();
            console.log("Upload response:", uploadData);
            setFormData((prev) => ({ ...prev, link: uploadData.url }));
            toast.success("File uploaded successfully");
            setIsUploading(false);
            return;
          } else {
            console.log(
              `Upload endpoint ${endpoint} returned status ${response.status}`
            );
          }
        } catch (endpointError) {
          console.error(
            `Error with upload endpoint ${endpoint}:`,
            endpointError
          );
        }
      }

      // If we reach here, all endpoints failed
      throw new Error("Failed to upload file. All endpoints failed.");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Save notice (add or edit)
  const handleSaveNotice = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.link) {
      toast.error("Please upload a file first");
      return;
    }

    try {
      // Get the token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("You are not logged in. Please log in to save notices.");
        return;
      }

      console.log("Saving notice:", isEditing ? "update" : "create");

      // Prepare the backend URL and possible endpoints
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Multiple endpoint patterns to try
      const possibleEndpoints =
        isEditing && currentNotice
          ? [
              `/notice/${currentNotice._id}`,
              `/notices/${currentNotice._id}`,
              `/api/notice/${currentNotice._id}`,
              `/api/notices/${currentNotice._id}`,
            ]
          : [`/notice`, `/notices`, `/api/notice`, `/api/notices`];

      // Prepare HTTP method based on operation
      const method = isEditing ? "PUT" : "POST";

      // Prepare the request body
      const requestBody = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        link: formData.link,
        content: formData.description?.trim() || formData.title.trim(),
        type: formData.type,
        company: formData.company,
        date: formData.date,
      };

      let successful = false;

      for (const endpoint of possibleEndpoints) {
        if (successful) break;

        try {
          const fullUrl = `${backendUrl}${endpoint}`;
          console.log("Attempting request to:", fullUrl);
          console.log("Request method:", method);
          console.log("Request body:", requestBody);

          const response = await fetch(fullUrl, {
            method,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (response.ok) {
            console.log(`Success with endpoint: ${endpoint}`);
            successful = true;

            // Refresh the notices list
            await fetchNotices();
            toast.success(
              `Notice ${isEditing ? "updated" : "added"} successfully`
            );
            setIsDialogOpen(false);
            return;
          } else {
            console.log(
              `Endpoint ${endpoint} returned status ${response.status}`
            );
          }
        } catch (endpointError) {
          console.error(`Error with endpoint ${endpoint}:`, endpointError);
        }
      }

      // If we reach here, all endpoints failed
      throw new Error(
        `Failed to ${
          isEditing ? "update" : "create"
        } notice. All endpoints failed.`
      );
    } catch (error) {
      console.error("Error saving notice:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save notice"
      );
    }
  };

  // Delete notice
  const handleDeleteNotice = async () => {
    if (!currentNotice) return;

    try {
      // Get the token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("You are not logged in. Please log in to delete notices.");
        return;
      }

      console.log("Deleting notice:", currentNotice._id);

      // Prepare the backend URL and possible endpoints
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Multiple endpoint patterns to try
      const possibleEndpoints = [
        `/notice/${currentNotice._id}`,
        `/notices/${currentNotice._id}`,
        `/api/notice/${currentNotice._id}`,
        `/api/notices/${currentNotice._id}`,
      ];

      let successful = false;

      for (const endpoint of possibleEndpoints) {
        if (successful) break;

        try {
          const fullUrl = `${backendUrl}${endpoint}`;
          console.log("Attempting delete request to:", fullUrl);

          const response = await fetch(fullUrl, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            console.log(`Success with deletion endpoint: ${endpoint}`);
            successful = true;

            // Refresh the notices list
            await fetchNotices();
            toast.success("Notice deleted successfully");
            setIsDeleteDialogOpen(false);
            return;
          } else {
            console.log(
              `Delete endpoint ${endpoint} returned status ${response.status}`
            );
          }
        } catch (endpointError) {
          console.error(
            `Error with delete endpoint ${endpoint}:`,
            endpointError
          );
        }
      }

      // If we reach here, all endpoints failed
      throw new Error("Failed to delete notice. All endpoints failed.");
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete notice"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-16 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-template">
          <Calendar className="h-6 w-6" />
          Manage Notices
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddNotice} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Notice
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {notices.length === 0 && !isLoading && (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">
              No notices found. Create your first notice by clicking "Add
              Notice".
            </p>
          </div>
        )}

        {notices.map((notice) => (
          <Card key={notice._id} className="group">
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-template">
                    {notice.title || "Untitled Notice"}
                  </p>
                  {notice.description && (
                    <p className="text-sm text-muted-foreground">
                      {notice.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {notice.type.charAt(0).toUpperCase() +
                        notice.type.slice(1)}
                    </Badge>
                    {notice.company && notice.company !== "General" && (
                      <Badge variant="outline" className="text-xs">
                        {notice.company}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {new Date(notice.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditNotice(notice)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">
                    Edit {notice?.title ?? "Notice"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(notice)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">
                    Delete {notice?.title ?? "Notice"}
                  </span>
                </Button>
                {notice.link && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      try {
                        // Fetch the PDF file
                        const response = await fetch(notice.link);
                        if (!response.ok)
                          throw new Error("Failed to fetch PDF");

                        // Get the blob
                        const blob = await response.blob();

                        // Create a blob URL
                        const blobUrl = window.URL.createObjectURL(blob);

                        // Create a temporary link
                        const link = document.createElement("a");
                        link.href = blobUrl;
                        link.download = `${notice.title || "notice"}.pdf`; // Set download filename
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";

                        // Append to body, click, and cleanup
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                      } catch (error) {
                        console.error("Error downloading PDF:", error);
                        toast.error("Failed to download PDF");
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">
                      Download {notice?.title ?? "Notice"}
                    </span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Notice Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Notice" : "Add New Notice"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter notice title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a brief description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Enter company name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Notice Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange(value, "type")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placement">Placement</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Upload PDF File</Label>
              <div className="flex gap-2">
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {isUploading && <div className="animate-spin">⌛</div>}
              </div>
              {formData.link && (
                <p className="text-sm text-muted-foreground">
                  Current file: {formData.link}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveNotice}>
              {isEditing ? "Update" : "Add"} Notice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this notice?</p>
            <p className="font-medium mt-2">
              {currentNotice?.title ?? "Unnamed Notice"}
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              type="button"
              onClick={handleDeleteNotice}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
