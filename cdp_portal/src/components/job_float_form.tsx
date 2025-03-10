import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Trash2 } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const formSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  package: z.string().min(1, "Package is required"),
  location: z.string().min(1, "Location is required"),
  deadline: z.string().min(1, "Application deadline is required"),
  accommodation: z.boolean(),
  eligibility: z.object({
    cgpa: z.string().min(1, "CGPA is required"),
    gender: z.enum(["All", "Male", "Female"]),
    branches: z.array(z.string()).min(1, "At least one branch must be selected"),
  }),
  hiringFlow: z
    .array(
      z.object({
        step: z.string().min(1, "Step is required"),
        description: z.string().min(1, "Description is required"),
      }),
    )
    .min(1, "At least one hiring step is required"),
  jobDescription: z.string().min(1, "Job description is required"),
})

type FormValues = z.infer<typeof formSchema>

export function JobFloatForm({ onSuccess, cycleId }: { onSuccess: () => void, cycleId: string }) {
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      package: "",
      location: "",
      deadline: "",
      accommodation: false,
      eligibility: {
        gender: "All",
        branches: [],
      },
      hiringFlow: [{ step: "", description: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "hiringFlow",
  })

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Format the data for the API
      const formattedData = {
        ...values,
        cycle: cycleId,
      }
      
      // Get the token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError("You must be logged in to create a job")
        return
      }
      
      // Call the API to create the job
      const response = await fetch(`${API_BASE_URL}/api/placement-cycles/${cycleId}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create job")
      }
      
      // Call the success callback
      onSuccess()
    } catch (error) {
      console.error("Error creating job:", error)
      setError(error instanceof Error ? error.message : "Failed to create job")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="hiring-flow">Hiring Flow</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" {...form.register("company")} />
                  {form.formState.errors.company && (
                    <p className="text-red-500 text-sm">{form.formState.errors.company.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" {...form.register("role")} />
                  {form.formState.errors.role && (
                    <p className="text-red-500 text-sm">{form.formState.errors.role.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="package">Package</Label>
                  <Input id="package" {...form.register("package")} />
                  {form.formState.errors.package && (
                    <p className="text-red-500 text-sm">{form.formState.errors.package.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...form.register("location")} />
                  {form.formState.errors.location && (
                    <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input id="deadline" type="date" {...form.register("deadline")} />
                  {form.formState.errors.deadline && (
                    <p className="text-red-500 text-sm">{form.formState.errors.deadline.message}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="accommodation" {...form.register("accommodation")} />
                  <Label htmlFor="accommodation">Accommodation Provided</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="eligibility" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cgpa">Minimum CGPA</Label>
                  <Input id="cgpa" {...form.register("eligibility.cgpa")} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    defaultValue="All"
                    onValueChange={(value) => form.setValue("eligibility.gender", value as "All" | "Male" | "Female")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="All" id="all" />
                      <Label htmlFor="all">All</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Eligible Branches</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["CSE", "ECE", "ME", "CE", "EE", "CH"].map((branch) => (
                    <div key={branch} className="flex items-center space-x-2">
                      <Checkbox
                        id={branch}
                        value={branch}
                        onCheckedChange={(checked) => {
                          const currentBranches = form.getValues("eligibility.branches")
                          if (checked) {
                            form.setValue("eligibility.branches", [...currentBranches, branch])
                          } else {
                            form.setValue(
                              "eligibility.branches",
                              currentBranches.filter((b) => b !== branch),
                            )
                          }
                        }}
                      />
                      <Label htmlFor={branch}>{branch}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="hiring-flow" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hiring Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-[1fr,auto] gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`step-${index}`}>Step {index + 1}</Label>
                          <Input id={`step-${index}`} {...form.register(`hiringFlow.${index}.step`)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`description-${index}`}>Description</Label>
                          <Input id={`description-${index}`} {...form.register(`hiringFlow.${index}.description`)} />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="mt-8"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ step: "", description: "" })}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="description" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea id="jobDescription" {...form.register("jobDescription")} className="min-h-[200px]" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const currentIndex = ["details", "eligibility", "hiring-flow", "description"].indexOf(activeTab)
            const prevTab = ["details", "eligibility", "hiring-flow", "description"][currentIndex - 1]
            if (prevTab) setActiveTab(prevTab)
          }}
          disabled={activeTab === "details" || isSubmitting}
        >
          Previous
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            const currentIndex = ["details", "eligibility", "hiring-flow", "description"].indexOf(activeTab)
            const nextTab = ["details", "eligibility", "hiring-flow", "description"][currentIndex + 1]
            if (nextTab) setActiveTab(nextTab)
            else form.handleSubmit(onSubmit)()
          }}
        >
          {activeTab === "description" ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
        </Button>
      </div>
    </form>
  )
}

