"use client";

import { NotificationListAdmin } from "@/components/notification_list_admin";
import { CommentSectionAdmin } from "@/components/comment_section_admin";
import { AddNotificationButton } from "@/components/add_notification_button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useApi } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import classNames from "classnames";
import {
  Loader2,
  AlertCircle,
  CalendarDays,
  Users,
  Briefcase,
} from "lucide-react";

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

export default function AdminNotificationPage() {
  const { fetchWithAuth } = useApi();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);

  // Fetch all placement cycles on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCycles = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth("/api/placement-cycles");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (isMounted) {
          setCycles(data);
          // Select the first cycle by default if available
          if (data.length > 0 && !selectedCycleId) {
            setSelectedCycleId(data[0].id);
          }
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : "An error occurred"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchCycles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch notifications when a cycle is selected
  useEffect(() => {
    if (!selectedCycleId) return;

    let isMounted = true;
    const fetchNotifications = async () => {
      setNotifLoading(true);
      try {
        const response = await fetchWithAuth(
          `/api/notifications/${selectedCycleId}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        const data = await response.json();
        if (isMounted) {
          setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "An error occurred while fetching notifications"
          );
        }
      } finally {
        if (isMounted) {
          setNotifLoading(false);
        }
      }
    };

    fetchNotifications();
    return () => {
      isMounted = false;
    };
  }, [selectedCycleId]);

  const handleNotificationChange = useCallback(() => {
    if (selectedCycleId) {
      const fetchNotifications = async () => {
        setNotifLoading(true);
        try {
          const response = await fetchWithAuth(
            `/api/notifications/${selectedCycleId}`
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          }
          const data = await response.json();
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
          setError(
            error instanceof Error
              ? error.message
              : "An error occurred while fetching notifications"
          );
        } finally {
          setNotifLoading(false);
        }
      };
      fetchNotifications();
    }
  }, [selectedCycleId, fetchWithAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Placement Cycles Found
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              There are no placement cycles available at the moment.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Placement Cycles Section */}
          <div>
            <h2 className="text-2xl font-bold text-template mb-4">
              Placement Cycles
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cycles.map((cycle) => (
                <Link
                  key={cycle.id}
                  href={`/admin/notifications/${cycle.id}`}
                  className="block w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-colors focus:outline-none"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-template">
                      {cycle.name}
                    </h3>
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
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{cycle.type}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(cycle.startDate).toLocaleDateString()} -{" "}
                      {new Date(cycle.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {cycle.jobs} Jobs
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {cycle.students} Students
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
