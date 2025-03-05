import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface WorkflowStep {
  id: number;
  name: string;
  description: string;
}

interface JobWorkflowProps {
  steps: WorkflowStep[];
}

export function JobWorkflow({ steps }: JobWorkflowProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="relative">
          {steps.map((step, index) => (
            <div key={step.id} className="mb-8 flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="h-full w-0.5 bg-border mt-2"></div>
                )}
              </div>
              <div className="pt-2 pb-8">
                <h3 className="text-lg font-bold">{step.name}</h3>
                <p className="text-muted-foreground mt-1">{step.description}</p>

                {index === 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      In Progress
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Started on Oct 1, 2023
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
