"use client";

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
import {
  PlusCircle,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { useApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface Cycle {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  jobs: number;
  students: number;
}

export default function CyclesPage() {
  const { fetchWithAuth } = useApi();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCycles, setSelectedCycles] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCycles = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      if (typeFilter !== "all") queryParams.append("type", typeFilter);

      // Use useApi hook's fetchWithAuth method
      const response = await fetchWithAuth(
        `/api/placement-cycles?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch cycles: ${response.status}`);
      }

      const data = await response.json();
      setCycles(data);
    } catch (err) {
      console.error("Error fetching cycles:", err);
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, [statusFilter, typeFilter]);

  const toggleCycleSelection = (cycleId: string) => {
    if (selectedCycles.includes(cycleId)) {
      setSelectedCycles(selectedCycles.filter((id) => id !== cycleId));
    } else {
      setSelectedCycles([...selectedCycles, cycleId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedCycles.length === filteredCycles.length) {
      setSelectedCycles([]);
    } else {
      setSelectedCycles(filteredCycles.map((cycle) => cycle.id));
    }
  };

  const markCyclesInactive = async () => {
    setIsUpdating(true);
    try {
      const updatePromises = selectedCycles.map((cycleId) =>
        fetchWithAuth(`/api/placement-cycles/${cycleId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "inactive",
          }),
        })
      );

      await Promise.all(updatePromises);

      // Refresh the cycles data
      await fetchCycles();

      // Clear selection
      setSelectedCycles([]);
    } catch (err) {
      console.error("Error updating cycles:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to update cycles")
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter cycles based on search term
  const filteredCycles = cycles.filter((cycle) =>
    cycle.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-template">
            Placement Cycles
          </h1>
          <p className="text-muted-foreground">
            Manage all placement and internship cycles
          </p>
        </div>
        <div className="flex gap-2">
          {selectedCycles.length > 0 && (
            <Button
              variant="outline"
              onClick={markCyclesInactive}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Mark Inactive ({selectedCycles.length})
            </Button>
          )}
          <Link href="/admin/placement_cycles/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Cycle
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cycles..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
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

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Cycles</h3>
          <p className="text-muted-foreground text-center mb-4">
            {error.message}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : filteredCycles.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">No cycles found</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={
                      selectedCycles.length === filteredCycles.length &&
                      filteredCycles.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCycles.map((cycle) => (
                <TableRow
                  key={cycle.id}
                  className="hover:bg-muted transition-colors cursor-pointer"
                >
                  {/* Non-clickable checkbox cell */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedCycles.includes(cycle.id)}
                      onCheckedChange={() => toggleCycleSelection(cycle.id)}
                    />
                  </TableCell>

                  {/* Clickable cells */}
                  <Link
                    href={`/admin/placement_cycles/${cycle.id}`}
                    className="contents"
                  >
                    <TableCell className="font-bold">{cycle.name}</TableCell>
                    <TableCell>{cycle.type}</TableCell>
                    <TableCell>
                      {formatDate(cycle.startDate)} -{" "}
                      {formatDate(cycle.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          cycle.status.toLowerCase() === "active"
                            ? "default"
                            : cycle.status.toLowerCase() === "completed"
                            ? "secondary"
                            : "outline"
                        }
                        className="bg-template"
                      >
                        {cycle.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{cycle.jobs || 0}</TableCell>
                    <TableCell>{cycle.students || 0}</TableCell>
                  </Link>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
