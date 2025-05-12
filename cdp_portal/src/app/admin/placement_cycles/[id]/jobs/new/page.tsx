import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { JobForm } from "@/components/job-form";

export default function NewJobPage(props: any) {
  const { params } = props;
  const { id } = params;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/admin/placement_cycles/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-template">
            Add New Job
          </h1>
          <p className="text-muted-foreground">
            Create a new job opening for this placement cycle
          </p>
        </div>
      </div>

      <Card className="p-6">
        <JobForm cycleId={id} />
      </Card>
    </div>
  );
}
