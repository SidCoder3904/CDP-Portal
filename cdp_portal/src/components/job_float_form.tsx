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

const formSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  stipend: z.string().min(1, "Stipend/Salary is required"),
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

export function JobFloatForm({ onSuccess }: { onSuccess: () => void }) {
  const [activeTab, setActiveTab] = useState("details")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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

  function onSubmit(values: FormValues) {
    console.log(values)
    onSuccess()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" {...form.register("role")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stipend">Stipend/Salary</Label>
                  <Input id="stipend" {...form.register("stipend")} />
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
          disabled={activeTab === "details"}
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={() => {
            const currentIndex = ["details", "eligibility", "hiring-flow", "description"].indexOf(activeTab)
            const nextTab = ["details", "eligibility", "hiring-flow", "description"][currentIndex + 1]
            if (nextTab) setActiveTab(nextTab)
            else form.handleSubmit(onSubmit)()
          }}
        >
          {activeTab === "description" ? "Submit" : "Next"}
        </Button>
      </div>
    </form>
  )
}

