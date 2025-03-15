"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobListing } from "@/lib/api/jobs";
import { Icons } from "@/components/icons";
import ResumeSelectDialog from "@/components/resume-select-dialog";

interface JobDetailsProps {
  job: JobListing;
  activeTab?: "description" | "eligibility";
  handleTabClick: (tab: "description" | "eligibility") => void;
  onApply: (jobId: string, resumeId: string) => Promise<void>;
  isApplied: boolean;
  isApplying: boolean;
}

export default function JobDetails({
  job,
  activeTab = "description",
  handleTabClick,
  onApply,
  isApplied,
  isApplying
}: JobDetailsProps) {
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  
  // Format job description as an array
  const jobDescriptionArray = Array.isArray(job.jobDescription) 
    ? job.jobDescription 
    : [job.jobDescription];

  // Format date for display
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const postedDate = job.createdAt ? formatDate(job.createdAt) : "";
  
  const handleApplyClick = () => {
    setIsResumeDialogOpen(true);
  };
  
  const handleResumeSubmit = async (resumeId: string) => {
    await onApply(job._id, resumeId);
    setIsResumeDialogOpen(false);
  };

  return (
    <>
      <Card className="border rounded-lg shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {job.logo && (
                <div className="w-16 h-16 mr-4 overflow-hidden rounded-md">
                  <img
                    src={job.logo}
                    alt={`${job.company} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{job.role}</h2>
                <p className="text-gray-600 text-lg">{job.company}</p>
                <div className="flex items-center mt-1 text-gray-500">
                  {job.location && <span className="mr-3">{job.location}</span>}
                  {postedDate && (
                    <span className="text-sm">Posted {postedDate}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Badge
                variant={
                  job.jobType === "Internship" ? "secondary" : "outline"
                }
                className="mb-2"
              >
                {job.jobType || "Placement"}
              </Badge>
              
              {job.isEligible === false && (
                <Badge variant="destructive" className="mb-2">
                  Not Eligible
                </Badge>
              )}
              
              <Button 
                onClick={handleApplyClick} 
                disabled={isApplied || isApplying || job.isEligible === false}
                className="bg-template hover:bg-template/90"
              >
                {isApplying ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : isApplied ? (
                  "Applied"
                ) : job.isEligible === false ? (
                  "Not Eligible"
                ) : (
                  "Apply Now"
                )}
              </Button>
            </div>
          </div>

          {(job.salary || job.stipend) && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium">Compensation</p>
              <p className="text-gray-700">
                {job.salary ? `Salary: ${job.salary}` : ''}
                {job.salary && job.stipend ? ' | ' : ''}
                {job.stipend ? `Stipend: ${job.stipend}` : ''}
              </p>
            </div>
          )}

          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={(value) =>
              handleTabClick(value as "description" | "eligibility")
            }
            className="mt-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Job Description</TabsTrigger>
              <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <div className="space-y-4">
                {job.jobFunctions && job.jobFunctions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Job Functions</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.jobFunctions.map((func, index) => (
                        <Badge key={index} variant="outline">
                          {func}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <div className="text-gray-700">
                    {Array.isArray(job.jobDescription) ? (
                      <ul className="list-disc pl-5 space-y-2">
                        {jobDescriptionArray.map((desc, index) => (
                          <li key={index}>{desc}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{job.jobDescription}</p>
                    )}
                  </div>
                </div>

                {job.hiringFlow && job.hiringFlow.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Hiring Process</h3>
                    <ol className="list-decimal pl-5 space-y-2">
                      {job.hiringFlow.map((step, index) => (
                        <li key={index} className="text-gray-700">
                          <span className="font-medium">{step.step}:</span> {step.description}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {job.accommodation !== undefined && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Additional Information</h3>
                    <p className="text-gray-700">
                      Accommodation: {job.accommodation ? "Provided" : "Not Provided"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="eligibility" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Eligibility Criteria</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium">Minimum CGPA</p>
                      <p className="text-gray-700">{job.eligibility.cgpa}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium">Gender</p>
                      <p className="text-gray-700">{job.eligibility.gender}</p>
                    </div>
                    {job.eligibility.degrees && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="font-medium">Eligible Degrees</p>
                        <p className="text-gray-700">
                          {job.eligibility.degrees.join(", ")}
                        </p>
                      </div>
                    )}
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="font-medium">Eligible Branches</p>
                      <p className="text-gray-700">
                        {job.eligibility.branches.join(", ")}
                      </p>
                    </div>
                    {job.eligibility.batches && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="font-medium">Eligible Batches</p>
                        <p className="text-gray-700">
                          {job.eligibility.batches.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <ResumeSelectDialog
        isOpen={isResumeDialogOpen}
        onClose={() => setIsResumeDialogOpen(false)}
        onSubmit={handleResumeSubmit}
        isSubmitting={isApplying}
      />
    </>
  );
}

