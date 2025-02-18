"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"

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
        step: z.string(),
        description: z.string(),
      }),
    )
    .min(1, "At least one hiring step is required"),
  jobDescription: z.string().min(1, "Job description is required"),
})

export function JobFloatForm({ onSuccess }: { onSuccess: () => void }) {
  const [hiringSteps, setHiringSteps] = useState([{ step: "", description: "" }])

  const form = useForm<z.infer<typeof formSchema>>({
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    onSuccess()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...form.register("company")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input id="role" {...form.register("role")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stipend">Stipend/Salary</Label>
          <Input id="stipend" {...form.register("stipend")} />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="accommodation" {...form.register("accommodation")} />
          <Label htmlFor="accommodation">Accommodation Provided</Label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Eligibility</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cgpa">Minimum CGPA</Label>
            <Input id="cgpa" {...form.register("eligibility.cgpa")} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup defaultValue="All" {...form.register("eligibility.gender")}>
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
                <Checkbox id={branch} value={branch} {...form.register("eligibility.branches")} />
                <Label htmlFor={branch}>{branch}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Hiring Flow</h3>
        {hiringSteps.map((step, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`step-${index}`}>Step</Label>
                  <Input id={`step-${index}`} {...form.register(`hiringFlow.${index}.step`)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input id={`description-${index}`} {...form.register(`hiringFlow.${index}.description`)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => setHiringSteps([...hiringSteps, { step: "", description: "" }])}
        >
          Add Step
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobDescription">Job Description</Label>
        <Textarea id="jobDescription" {...form.register("jobDescription")} className="min-h-[200px]" />
      </div>

      <Button type="submit" className="w-full bg-[#002147] hover:bg-[#003167]">
        Float Job
      </Button>
    </form>
  )
}

