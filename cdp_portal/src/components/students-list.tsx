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
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Download } from "lucide-react";

interface StudentsListProps {
  cycleId: string;
}

export function StudentsList({ cycleId }: StudentsListProps) {
  // Mock data - in a real app, this would be fetched based on the cycleId
  const students = [
    {
      id: "S001",
      name: "Rahul Sharma",
      rollNo: "CS19001",
      branch: "Computer Science",
      program: "B.Tech",
      cgpa: 9.2,
      status: "Registered",
      jobsApplied: 5,
      jobsSelected: 1,
      jobsRejected: 2,
      jobsInProgress: 2,
    },
    {
      id: "S002",
      name: "Priya Patel",
      rollNo: "CS19045",
      branch: "Computer Science",
      program: "B.Tech",
      cgpa: 8.7,
      status: "Registered",
      jobsApplied: 4,
      jobsSelected: 0,
      jobsRejected: 1,
      jobsInProgress: 3,
    },
    {
      id: "S003",
      name: "Amit Kumar",
      rollNo: "EC19023",
      branch: "Electronics",
      program: "B.Tech",
      cgpa: 8.9,
      status: "Placed",
      jobsApplied: 3,
      jobsSelected: 1,
      jobsRejected: 2,
      jobsInProgress: 0,
    },
    {
      id: "S004",
      name: "Sneha Gupta",
      rollNo: "ME19056",
      branch: "Mechanical",
      program: "B.Tech",
      cgpa: 8.5,
      status: "Registered",
      jobsApplied: 2,
      jobsSelected: 0,
      jobsRejected: 0,
      jobsInProgress: 2,
    },
    {
      id: "S005",
      name: "Vikram Singh",
      rollNo: "CS19078",
      branch: "Computer Science",
      program: "B.Tech",
      cgpa: 9.5,
      status: "Placed",
      jobsApplied: 6,
      jobsSelected: 2,
      jobsRejected: 3,
      jobsInProgress: 1,
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
              placeholder="Search students..."
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="cs">Computer Science</SelectItem>
              <SelectItem value="ec">Electronics</SelectItem>
              <SelectItem value="me">Mechanical</SelectItem>
              <SelectItem value="ee">Electrical</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="not-registered">Not Registered</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Roll No</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>CGPA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Selected</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.rollNo}</TableCell>
                <TableCell>{student.branch}</TableCell>
                <TableCell>{student.program}</TableCell>
                <TableCell>{student.cgpa}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      student.status === "Placed"
                        ? "default"
                        : student.status === "Registered"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell>{student.jobsApplied}</TableCell>
                <TableCell>{student.jobsSelected}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
