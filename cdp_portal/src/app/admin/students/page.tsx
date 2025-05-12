"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useApi } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export default function StudentManagement() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { fetchWithAuth } = useApi();

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetchWithAuth("/api/students/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create student account");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: "Student account created successfully",
      });

      // Reset form
      setName("");
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create student account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetchWithAuth("/api/students/bulk-create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process file");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: data.message,
      });

      // Reset form
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen container mx-auto py-10">
      <div className="flex flex-col items-center space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-template">
            Register Students
          </h1>
          <p className="text-gray-600 mt-2">Add new students to the portal</p>
        </div>

        <Tabs defaultValue="manual" className="w-full max-w-2xl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <Card>
              <CardHeader>
                <CardTitle className="text-template">
                  Add Single Student
                </CardTitle>
                <CardDescription>
                  Create a new student account manually
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter student name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter student email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <CardDescription>
                    Student will be assigned default password as 123456789
                  </CardDescription>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Student Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle className="text-template">
                  Bulk Upload Students
                </CardTitle>
                <CardDescription>
                  Upload a CSV or Excel file containing student details (File
                  columns: name, email)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBulkCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <CardDescription>
                    Student will be assigned default password as 123456789
                  </CardDescription>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Upload and Process
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
