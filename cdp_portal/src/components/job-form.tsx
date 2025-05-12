"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { HiringWorkflow } from "@/components/hiring-workflow";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Upload } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { FileUploader } from "@/components/file-uploader";
import { ImageCropModal } from "@/components/image-crop-model";

interface JobFormProps {
  cycleId: string;
  onSuccess?: () => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const formSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  package: z.string().min(1, "Package is required"),
  location: z.string().min(1, "Location is required"),
  deadline: z.string().min(1, "Application deadline is required"),
  accommodation: z.boolean().default(false),
  companyImage: z.string().optional(),
  companyImagePublicId: z.string().optional(),
  jobDescriptionFile: z.string().optional(),
  jobDescriptionFilePublicId: z.string().optional(),
  eligibility: z.object({
    uniformCgpa: z.boolean().default(true),
    cgpaCriteria: z.record(z.string()).optional(),
    cgpa: z.string().min(1, "CGPA is required"),
    gender: z.enum(["All", "Male", "Female"]),
    branches: z
      .array(z.string())
      .min(1, "At least one branch must be selected"),
  }),
  hiringFlow: z
    .array(
      z.object({
        step: z.string().min(1, "Step is required"),
        description: z.string().min(1, "Description is required"),
      })
    )
    .min(1, "At least one hiring step is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function JobForm({ cycleId, onSuccess }: JobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { token } = useAuth();

  const [workflowSteps, setWorkflowSteps] = useState([
    {
      id: 1,
      name: "Resume Shortlisting",
      description: "Initial screening of resumes",
    },
    { id: 2, name: "Online Assessment", description: "Technical assessment" },
    {
      id: 3,
      name: "Technical Interview",
      description: "Technical skills evaluation",
    },
    { id: 4, name: "HR Interview", description: "Cultural fit and HR round" },
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      role: "",
      package: "",
      location: "",
      deadline: "",
      accommodation: false,
      eligibility: {
        uniformCgpa: true,
        cgpa: "7.0",
        cgpaCriteria: {},
        gender: "All",
        branches: [],
      },
      hiringFlow: workflowSteps.map((step) => ({
        step: step.name,
        description: step.description,
      })),
      jobDescription: "",
    },
  });

  // Fix the default onSuccess parameter
  const defaultOnSuccess = () => {
    router.push(`/admin/placement_cycles/${cycleId}`);
  };

  // Use the provided onSuccess or the default one
  const handleSuccess = onSuccess || defaultOnSuccess;

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Explicitly get the latest form values before formatting
      const currentFormValues = form.getValues();

      // Format the data for the API using the latest values
      const formattedData = {
        ...currentFormValues, // Use latest values
        cycle: cycleId,
        hiringFlow: workflowSteps.map((step) => ({
          step: step.name,
          description: step.description,
        })),
        logo: currentFormValues.companyImage, // Ensure latest logo URL is used
        jobDescriptionFile: currentFormValues.jobDescriptionFile,
        companyImagePublicId: currentFormValues.companyImagePublicId, // Ensure latest public ID is used
        jobDescriptionFilePublicId: currentFormValues.jobDescriptionFilePublicId,
      };

      // Call the API to create the job
      const response = await fetch(
        `${API_BASE_URL}/api/placement-cycles/${cycleId}/jobs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create job");
      }

      // Call the success callback
      handleSuccess();
    } catch (error) {
      console.error("Error creating job:", error);
      setError(error instanceof Error ? error.message : "Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  }

  const branches = [
    { id: "CSE", label: "Computer Science" },
    { id: "EE", label: "Electrical" },
    { id: "ME", label: "Mechanical" },
    { id: "CE", label: "Civil" },
    { id: "MM", label: "Metallurgical" },
    { id: "CH", label: "Chemical" },
  ];

  const genders = [
    { id: "All", label: "All" },
    { id: "Male", label: "Male" },
    { id: "Female", label: "Female" },
  ];

  const handleImageSelection = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsImageCropModalOpen(true);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setIsUploadingImage(true);
      setError(null);

      // No need to fetch the blob URL anymore
      // const response = await fetch(croppedImageUrl);
      // const croppedImageBlob = await response.blob();

      // Create the File object directly from the Blob
      const imageFile = new File([croppedImageBlob], "company-logo.jpg", {
        type: "image/jpeg",
      });

      // Generate a temporary ID using timestamp
      const tempCompanyId = `temp_${Date.now()}`;

      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("company_id", tempCompanyId);

      const apiResponse = await fetch(
        `${API_BASE_URL}/api/jobs/upload-company-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await apiResponse.json();
      form.setValue("companyImage", data.imageUrl);
      form.setValue("companyImagePublicId", data.publicId);

      setIsImageCropModalOpen(false);
      setSelectedImage(null); // Clear the temporary preview URL
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploadingFile(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("job_id", cycleId);

      const response = await fetch(
        `${API_BASE_URL}/api/jobs/upload-job-description`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const data = await response.json();
      form.setValue("jobDescriptionFile", data.fileUrl);
      form.setValue("jobDescriptionFilePublicId", data.publicId);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    } finally {
      setIsUploadingFile(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Company Image</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center">
                  {form.watch("companyImage") ? (
                    <div className="relative w-full">
                      <img
                        src={form.watch("companyImage")}
                        alt="Company"
                        className="w-full h-48 object-contain rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          form.setValue("companyImage", "");
                          form.setValue("companyImagePublicId", "");
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <FileUploader
                      onFileUpload={handleImageSelection}
                      acceptedFileTypes={{
                        "image/*": [".jpeg", ".jpg", ".png"],
                      }}
                      maxSize={5 * 1024 * 1024} // 5MB
                    />
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="package"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. ₹15 LPA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bangalore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter detailed job description..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accommodation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Accommodation Provided</FormLabel>
                      <FormDescription>
                        Check if accommodation is provided for this role
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Criteria</CardTitle>
                  <CardDescription>
                    Define who can apply for this job
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="eligibility.branches"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Eligible Branches</FormLabel>
                          <FormDescription>
                            Select the branches eligible for this job
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {branches.map((branch) => (
                            <FormItem
                              key={branch.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(branch.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          branch.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== branch.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {branch.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eligibility.cgpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum CGPA</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select minimum CGPA" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="6.0">6.0</SelectItem>
                            <SelectItem value="6.5">6.5</SelectItem>
                            <SelectItem value="7.0">7.0</SelectItem>
                            <SelectItem value="7.5">7.5</SelectItem>
                            <SelectItem value="8.0">8.0</SelectItem>
                            <SelectItem value="8.5">8.5</SelectItem>
                            <SelectItem value="9.0">9.0</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eligibility.uniformCgpa"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Use same CGPA for all branches</FormLabel>
                          <FormDescription>
                            When checked, a single CGPA value will be applied to
                            all branches
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("eligibility.uniformCgpa") ? (
                    <FormField
                      control={form.control}
                      name="eligibility.cgpa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum CGPA (All Branches)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select minimum CGPA" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="6.0">6.0</SelectItem>
                              <SelectItem value="6.5">6.5</SelectItem>
                              <SelectItem value="7.0">7.0</SelectItem>
                              <SelectItem value="7.5">7.5</SelectItem>
                              <SelectItem value="8.0">8.0</SelectItem>
                              <SelectItem value="8.5">8.5</SelectItem>
                              <SelectItem value="9.0">9.0</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    // Existing branch-specific CGPA criteria UI
                    <div className="space-y-4">
                      <FormLabel>CGPA Criteria</FormLabel>
                      <FormDescription>
                        Set CGPA requirements for each branch
                      </FormDescription>

                      {form.watch("eligibility.branches").map((branchId) => {
                        const branch = branches.find((b) => b.id === branchId);

                        return (
                          <div key={branchId} className="space-y-2">
                            <div className="flex items-center gap-4">
                              <span className="w-1/3">{branch?.label}:</span>
                              <FormField
                                control={form.control}
                                name={`eligibility.cgpaCriteria.${branchId}`}
                                render={({ field }) => (
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || "7.0"}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select CGPA" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="6.0">6.0</SelectItem>
                                      <SelectItem value="6.5">6.5</SelectItem>
                                      <SelectItem value="7.0">7.0</SelectItem>
                                      <SelectItem value="7.5">7.5</SelectItem>
                                      <SelectItem value="8.0">8.0</SelectItem>
                                      <SelectItem value="8.5">8.5</SelectItem>
                                      <SelectItem value="9.0">9.0</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="eligibility.gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender Eligibility</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender eligibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genders.map((gender) => (
                              <SelectItem key={gender.id} value={gender.id}>
                                {gender.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hiring Workflow</CardTitle>
                  <CardDescription>
                    Define the stages in your hiring process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HiringWorkflow
                    steps={workflowSteps}
                    setSteps={setWorkflowSteps}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push(`/admin/placement_cycles/${cycleId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      </Form>

      {selectedImage && (
        <ImageCropModal
          isOpen={isImageCropModalOpen}
          onClose={() => {
            setIsImageCropModalOpen(false);
            setSelectedImage(null); // Also clear preview URL on manual close
          }}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}
