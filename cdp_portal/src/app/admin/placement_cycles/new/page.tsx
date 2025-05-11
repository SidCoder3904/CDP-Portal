import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { CycleForm } from "@/components/cycle-form";

export default function NewCyclePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/placement_cycles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Cycle
          </h1>
          <p className="text-muted-foreground">
            Set up a new placement or internship cycle
          </p>
        </div>
      </div>

      <Card className="p-6">
        <CycleForm />
      </Card>
    </div>
  );
}
