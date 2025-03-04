"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, MinusCircle, ArrowUp, ArrowDown } from "lucide-react";

interface WorkflowStep {
  id: number;
  name: string;
  description: string;
}

interface HiringWorkflowProps {
  steps: WorkflowStep[];
  setSteps: React.Dispatch<React.SetStateAction<WorkflowStep[]>>;
}

export function HiringWorkflow({ steps, setSteps }: HiringWorkflowProps) {
  const [newStepName, setNewStepName] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");

  const addStep = () => {
    if (newStepName.trim() === "") return;

    const newStep = {
      id: steps.length > 0 ? Math.max(...steps.map((s) => s.id)) + 1 : 1,
      name: newStepName,
      description: newStepDescription,
    };

    setSteps([...steps, newStep]);
    setNewStepName("");
    setNewStepDescription("");
  };

  const removeStep = (id: number) => {
    setSteps(steps.filter((step) => step.id !== id));
  };

  const moveStep = (id: number, direction: "up" | "down") => {
    const index = steps.findIndex((step) => step.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap the steps
    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];

    setSteps(newSteps);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-start gap-2 p-3 border rounded-md bg-background"
          >
            <div className="flex flex-col items-center justify-center mt-1 text-muted-foreground">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveStep(step.id, "up")}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{index + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveStep(step.id, "down")}
                disabled={index === steps.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 space-y-2">
              <Input
                value={step.name}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[index].name = e.target.value;
                  setSteps(newSteps);
                }}
                placeholder="Step name"
              />
              <Textarea
                value={step.description}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[index].description = e.target.value;
                  setSteps(newSteps);
                }}
                placeholder="Step description"
                className="min-h-[60px]"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => removeStep(step.id)}
            >
              <MinusCircle className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Add New Step</h4>
        <div className="grid grid-cols-1 gap-2">
          <Input
            value={newStepName}
            onChange={(e) => setNewStepName(e.target.value)}
            placeholder="Step name (e.g. Technical Interview)"
          />
          <Textarea
            value={newStepDescription}
            onChange={(e) => setNewStepDescription(e.target.value)}
            placeholder="Step description (optional)"
            className="min-h-[60px]"
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={addStep}
            disabled={newStepName.trim() === ""}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </div>
      </div>
    </div>
  );
}
