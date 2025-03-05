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

export default function CyclesPage() {
  const cycles = [
    {
      id: 1,
      name: "Placement Cycle 2025",
      type: "Placement",
      startDate: "Aug 1, 2024",
      endDate: "Apr 30, 2025",
      status: "Active",
      jobs: 12,
      students: 450,
    },
    {
      id: 2,
      name: "Internship Cycle 2024",
      type: "Internship",
      startDate: "Sep 15, 2023",
      endDate: "Dec 31, 2023",
      status: "Active",
      jobs: 8,
      students: 320,
    },
    {
      id: 3,
      name: "Placement Cycle 2024",
      type: "Placement",
      startDate: "Aug 1, 2023",
      endDate: "Apr 30, 2024",
      status: "Completed",
      jobs: 45,
      students: 425,
    },
    {
      id: 4,
      name: "Internship Cycle 2023",
      type: "Internship",
      startDate: "Sep 15, 2022",
      endDate: "Dec 31, 2022",
      status: "Completed",
      jobs: 32,
      students: 380,
    },
    {
      id: 5,
      name: "Summer Internship 2024",
      type: "Internship",
      startDate: "Jan 15, 2024",
      endDate: "Jun 30, 2024",
      status: "Upcoming",
      jobs: 0,
      students: 0,
    },
  ];

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
            {cycles.map((cycle) => (
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
