"use client";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Cycle name must be at least 2 characters.",
  }),
  type: z.string({
    required_error: "Please select a cycle type.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  startDate: z.string().min(1, {
    message: "Start date is required.",
  }),
  endDate: z.string().min(1, {
    message: "End date is required.",
  }),
  eligibleBranches: z.array(z.string()).min(1, {
    message: "Select at least one branch.",
  }),
  eligiblePrograms: z.array(z.string()).min(1, {
    message: "Select at least one program.",
  }),
  coordinators: z.string().min(1, {
    message: "Coordinators are required.",
  }),
});

export function CycleForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      startDate: "",
      endDate: "",
      eligibleBranches: [],
      eligiblePrograms: [],
      coordinators: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, this would send the data to an API
    console.log(values);

    // Navigate back to the cycles page
    router.push("/admin/placement_cycles/cycles");
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cycle Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Placement Cycle 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cycle Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cycle type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Placement">Placement</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter cycle description..."
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
              name="coordinators"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordinators</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter coordinator names (one per line)..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter one coordinator per line
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="eligibleBranches"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Eligible Branches</FormLabel>
                    <FormDescription>
                      Select the branches eligible for this cycle
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
                      Select the programs eligible for this cycle
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
                                  checked={field.value?.includes(program.id)}
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
          </div>
        </div>

        <Separator />

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/admin/placement_cycles/cycles")}
          >
            Cancel
          </Button>
          <Button type="submit">Create Cycle</Button>
        </div>
      </form>
    </Form>
  );
}
