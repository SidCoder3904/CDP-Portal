"use client";

import { NotificationListAdmin } from "@/components/notification_list_admin";
import { CommentSectionAdmin } from "@/components/comment_section_admin";
import { AddNotificationButton } from "@/components/add_notification_button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useApi } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import classNames from "classnames";

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
        const response = await fetchWithAuth('/api/placement-cycles');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
          setError(error instanceof Error ? error.message : 'An error occurred');
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
        const response = await fetchWithAuth(`/api/notifications/${selectedCycleId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'An error occurred while fetching notifications');
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
          const response = await fetchWithAuth(`/api/notifications/${selectedCycleId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setNotifications(data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          setError(error instanceof Error ? error.message : 'An error occurred while fetching notifications');
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
            <h3 className="text-lg font-semibold mb-2">No Placement Cycles Found</h3>
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
            <h2 className="text-2xl font-bold text-template mb-4">Placement Cycles</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cycles.map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => setSelectedCycleId(cycle.id)}
                  className={classNames(
                    "block w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-colors focus:outline-none",
                    selectedCycleId === cycle.id ? "ring-2 ring-template bg-blue-50" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{cycle.name}</h3>
                    <Badge
                      variant={
                        cycle.status.toLowerCase() === "active"
                          ? "default"
                          : cycle.status.toLowerCase() === "completed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {cycle.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{cycle.type}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <p>
                      {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4">
                      <span>{cycle.jobs} Jobs</span>
                      <span>{cycle.students} Students</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Section */}
          {selectedCycleId && (
            <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-template">
                    Recent Notifications
                  </h2>
                  <AddNotificationButton 
                    placementCycleId={selectedCycleId} 
                    onNotificationAdded={handleNotificationChange} 
                  />
                </div>
                <div>
                  <NotificationListAdmin 
                    notifications={notifications} 
                    loading={notifLoading} 
                    onNotificationChange={handleNotificationChange}
                  />
                </div>
              </div>
              <div>
                <CommentSectionAdmin placementCycleId={selectedCycleId} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
