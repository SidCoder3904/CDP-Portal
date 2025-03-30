"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { useApi } from "@/lib/api";

interface Resume {
  _id: string;
  name: string;
  fileUrl: string;
  createdAt: string;
  verified: boolean;
}

interface ResumeSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resumeId: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function ResumeSelectDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}: ResumeSelectDialogProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { fetchWithAuth } = useApi();
  
  useEffect(() => {
    if (isOpen) {
      fetchResumes();
    }
  }, [isOpen]);
  
  const fetchResumes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithAuth('/api/students/me/documents?type=resume');
      
      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }
      
      const data = await response.json();
      setResumes(data);
      
      // Auto-select the first resume if available
      if (data.length > 0) {
        setSelectedResumeId(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setError('Failed to load your resumes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    // if (!selectedResumeId) {
    //   setError('Please select a resume to continue');
    //   return;
    // }
    
    await onSubmit(selectedResumeId);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Resume for Application</DialogTitle>
          <DialogDescription>
            Choose a resume to submit with your job application
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchResumes}>Try Again</Button>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-6">
            <p className="mb-4">You haven't uploaded any resumes yet.</p>
            <Button asChild>
              <a href="/student/profile/documents">Upload Resume</a>
            </Button>
          </div>
        ) : (
          <RadioGroup
            value={selectedResumeId}
            onValueChange={setSelectedResumeId}
            className="space-y-3 py-4"
          >
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className={`flex items-center space-x-2 border rounded-md p-3 ${
                  selectedResumeId === resume._id ? "border-primary" : "border-gray-200"
                }`}
              >
                <RadioGroupItem value={resume._id} id={resume._id} />
                <Label htmlFor={resume._id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{resume.name}</div>
                  <div className="text-sm text-gray-500">
                    Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                  </div>
                  {resume.verified && (
                    <div className="text-xs text-green-600 flex items-center mt-1">
                      {/* <Icons.check className="h-3 w-3 mr-1" /> */}
                      Verified
                    </div>
                  )}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(resume.fileUrl, '_blank')}
                >
                  {/* <Icons.eye className="h-4 w-4" /> */}
                </Button>
              </div>
            ))}
          </RadioGroup>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            // disabled={isLoading || isSubmitting || !selectedResumeId || resumes.length === 0}
            disabled={isLoading || isSubmitting}

          >
            {isSubmitting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 