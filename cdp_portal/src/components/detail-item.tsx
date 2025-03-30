import { Badge } from "@/components/ui/badge";
import { Check, X, AlertCircle } from "lucide-react";

interface DetailItemProps {
  label: string;
  value: string | number;
  status: "verified" | "rejected" | "pending";
}

export function DetailItem({ label, value, status }: DetailItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">{label}</p>
        {status === "verified" ? (
          <Badge variant="default" className="flex items-center">
            <Check className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        ) : status === "rejected" ? (
          <Badge variant="destructive" className="flex items-center">
            <X className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
