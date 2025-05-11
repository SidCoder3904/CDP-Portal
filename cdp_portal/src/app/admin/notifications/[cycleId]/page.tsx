"use client";

import { NotificationListAdmin } from "@/components/notification_list_admin";
import { CommentSectionAdmin } from "@/components/comment_section_admin";
import { AddNotificationButton } from "@/components/add_notification_button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useApi } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

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

export default function CycleNotificationsPage() {
  const { cycleId } = useParams();
  const { fetchWithAuth } = useApi();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);

  // Fetch cycle details and notifications on mount
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch cycle details
        const cycleResponse = await fetchWithAuth(
          `/api/placement-cycles/${cycleId}`
        );
        if (!cycleResponse.ok)
          throw new Error(`HTTP error! status: ${cycleResponse.status}`);
        const cycleData = await cycleResponse.json();

        // Fetch notifications
        const notifResponse = await fetchWithAuth(
          `/api/notifications/${cycleId}`
        );
        if (!notifResponse.ok)
          throw new Error(`HTTP error! status: ${notifResponse.status}`);
        const notifData = await notifResponse.json();

        if (isMounted) {
          setCycle(cycleData);
          setNotifications(notifData);
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

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [cycleId]);

  const handleNotificationChange = useCallback(() => {
    const fetchNotifications = async () => {
      setNotifLoading(true);
      try {
        const response = await fetchWithAuth(`/api/notifications/${cycleId}`);
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
  }, [cycleId, fetchWithAuth]);

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
            <Link href="/admin/notifications">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2 " />
                Back to Notifications
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Placement Cycle Not Found
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              The requested placement cycle could not be found.
            </p>
            <Link href="/admin/notifications">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Notifications
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/notifications">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4 text-template" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-template">
                  {cycle.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
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
                  <span className="text-sm text-gray-500">
                    {new Date(cycle.startDate).toLocaleDateString()} -{" "}
                    {new Date(cycle.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <AddNotificationButton
              placementCycleId={cycleId as string}
              onNotificationAdded={handleNotificationChange}
            />
          </div>

          {/* Content Section */}
          <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <NotificationListAdmin
                notifications={notifications}
                loading={notifLoading}
                onNotificationChange={handleNotificationChange}
              />
            </div>
            <div>
              <CommentSectionAdmin placementCycleId={cycleId as string} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
