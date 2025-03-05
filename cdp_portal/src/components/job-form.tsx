"use client";

import { useState } from "react";
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

interface JobFormProps {
  cycleId: string;
}

const formSchema = z.object({
  company: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  role: z.string().min(2, {
    message: "Job role must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Job description must be at least 10 characters.",
  }),
  package: z.string().min(1, {
    message: "Package is required.",
  }),
  location: z.string().min(1, {
    message: "Location is required.",
  }),
  deadline: z.string().min(1, {
    message: "Application deadline is required.",
  }),
  eligibleBranches: z.array(z.string()).min(1, {
    message: "Select at least one branch.",
  }),
  minCGPA: z.string().min(1, {
    message: "Minimum CGPA is required.",
  }),
  eligibleGenders: z.array(z.string()).min(1, {
    message: "Select at least one gender option.",
  }),
  eligiblePrograms: z.array(z.string()).min(1, {
    message: "Select at least one program.",
  }),
});

export function JobForm({ cycleId }: JobFormProps) {
  const router = useRouter();
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      role: "",
      description: "",
      package: "",
      location: "",
      deadline: "",
      eligibleBranches: [],
      minCGPA: "7.0",
      eligibleGenders: ["Male", "Female", "Other"],
      eligiblePrograms: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, this would send the data to an API
    console.log({ ...values, workflowSteps, cycleId });

    // Navigate back to the cycle page
    router.push(`/admin/placement_cycles/cycles/${cycleId}`);
  }

  const branches = [
    { id: "cs", label: "Computer Science" },
    { id: "ec", label: "Electronics" },
    { id: "ee", label: "Electrical" },
    { id: "me", label: "Mechanical" },
    { id: "ce", label: "Civil" },
  ];

  const programs = [
    { id: "btech", label: "B.Tech" },
    { id: "mtech", label: "M.Tech" },
    { id: "mca", label: "MCA" },
    { id: "phd", label: "PhD" },
  ];

  const genders = [
    { id: "Male", label: "Male" },
    { id: "Female", label: "Female" },
    { id: "Other", label: "Other" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              name="description"
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

            <div className="space-y-2">
              <Label>Job Description Document</Label>
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drag and drop your JD file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOCX (Max 5MB)
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Upload File
                </Button>
              </div>
            </div>
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
                  name="eligibleBranches"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Eligible Branches</FormLabel>
                        <FormDescription>
                          Select the branches eligible for this job
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {branches.map((branch) => (
                          <FormField
                            key={branch.id}
                            control={form.control}
                            name="eligibleBranches"
                            render={({ field }) => {
                              return (
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
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eligiblePrograms"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Eligible Programs</FormLabel>
                        <FormDescription>
                          Select the programs eligible for this job
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {programs.map((program) => (
                          <FormField
                            key={program.id}
                            control={form.control}
                            name="eligiblePrograms"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={program.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        program.id
                                      )}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              program.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== program.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {program.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minCGPA"
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
                  name="eligibleGenders"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Gender Eligibility</FormLabel>
                        <FormDescription>
                          Select eligible genders for this job
                        </FormDescription>
                      </div>
                      <div className="flex gap-4">
                        {genders.map((gender) => (
                          <FormField
                            key={gender.id}
                            control={form.control}
                            name="eligibleGenders"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={gender.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(gender.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              gender.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== gender.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {gender.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
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
            onClick={() => router.push(`/admin/placement_cycles/cycles/${cycleId}`)}
          >
            Cancel
          </Button>
          <Button type="submit">Create Job</Button>
        </div>
      </form>
    </Form>
  );
}
