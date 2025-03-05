import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface JobsListProps {
  cycleId: string;
}

export function JobsList({ cycleId }: JobsListProps) {
  // Mock data - in a real app, this would be fetched based on the cycleId
  const jobs = [
    {
      id: 1,
      company: "Google",
      role: "Software Engineer",
      package: "₹25 LPA",
      location: "Bangalore",
      deadline: "Oct 15, 2023",
      status: "Open",
      applicants: 120,
      selected: 0,
    },
    {
      id: 2,
      company: "Microsoft",
      role: "Product Manager",
      package: "₹22 LPA",
      location: "Hyderabad",
      deadline: "Oct 10, 2023",
      status: "Open",
      applicants: 85,
      selected: 0,
    },
    {
      id: 3,
      company: "Amazon",
      role: "Software Development Engineer",
      package: "₹20 LPA",
      location: "Bangalore",
      deadline: "Sep 30, 2023",
      status: "Closed",
      applicants: 150,
      selected: 12,
    },
    {
      id: 4,
      company: "Flipkart",
      role: "Data Scientist",
      package: "₹18 LPA",
      location: "Bangalore",
      deadline: "Oct 5, 2023",
      status: "Open",
      applicants: 65,
      selected: 0,
    },
    {
      id: 5,
      company: "Adobe",
      role: "Frontend Engineer",
      package: "₹16 LPA",
      location: "Noida",
      deadline: "Sep 25, 2023",
      status: "In Progress",
      applicants: 110,
      selected: 8,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs..."
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
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
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
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead>Selected</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/cycles/${cycleId}/jobs/${job.id}`}
                    className="hover:underline"
                  >
                    {job.company}
                  </Link>
                </TableCell>
                <TableCell>{job.role}</TableCell>
                <TableCell>{job.package}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>{job.deadline}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      job.status === "Open"
                        ? "default"
                        : job.status === "Closed"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>{job.applicants}</TableCell>
                <TableCell>{job.selected}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
