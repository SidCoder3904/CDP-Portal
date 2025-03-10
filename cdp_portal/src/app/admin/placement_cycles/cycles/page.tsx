import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Filter } from "lucide-react";

export default async function CyclesPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  
  console.log(backendUrl);

  // Fetch cycles data from the backend API
  const response = await fetch(`${backendUrl}/api/placement-cycles`, {
    cache: 'no-store', // Ensures fresh data on each request
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cycles: ${response.status}`);
  }
  
  const cycles = await response.json();
  console.log(cycles);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Placement Cycles
          </h1>
          <p className="text-muted-foreground">
            Manage all placement and internship cycles
          </p>
        </div>
        <Link href="/admin/placement_cycles/cycles/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Cycle
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cycles..."
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="placement">Placement</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Jobs</TableHead>
              <TableHead>Students</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cycles.map((cycle: {
              id: string;
              name: string;
              type: string;
              startDate: string;
              endDate: string;
              status: string;
              jobs: number;
              students: number;
            }) => (
              <TableRow key={cycle.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/placement_cycles/cycles/${cycle.id}`}
                    className="hover:underline"
                  >
                    {cycle.name}
                  </Link>
                </TableCell>
                <TableCell>{cycle.type}</TableCell>
                <TableCell>
                  {cycle.startDate} - {cycle.endDate}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      cycle.status === "Active"
                        ? "default"
                        : cycle.status === "Completed"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {cycle.status}
                  </Badge>
                </TableCell>
                <TableCell>{cycle.jobs}</TableCell>
                <TableCell>{cycle.students}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
