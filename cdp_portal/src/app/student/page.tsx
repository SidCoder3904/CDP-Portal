"use client";

import { Separator } from "@/components/ui/separator";
import { NotificationList } from "@/components/notification_list";
import { CommentSection } from "@/components/comment_section";
import { useApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface Cycle {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function NotificationPage() {
  const router = useRouter();
  const { fetchWithAuth } = useApi();
  const { token, user } = useAuth();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const hasFetched = useRef(false);

  // Initial fetch on mount
  useEffect(() => {
    mounted.current = true;
    hasFetched.current = false;

    const fetchData = async () => {
      if (!token || !user || !mounted.current || hasFetched.current) return;

      setLoading(true);
      try {
        // Get student's active cycle
        const cycleResponse = await fetchWithAuth(
          "/api/placement-cycles/student",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!cycleResponse.ok) {
          const errorText = await cycleResponse.text();
          console.error("Cycle fetch error:", {
            status: cycleResponse.status,
            statusText: cycleResponse.statusText,
            error: errorText,
          });
          if (cycleResponse.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error(
            `HTTP error! status: ${cycleResponse.status} - ${errorText}`
          );
        }

        const cycleData = await cycleResponse.json();
        console.log("Cycle data:", cycleData);

        if (!mounted.current) return;

        if (!cycleData) {
          setError("No active placement cycle found");
          setLoading(false);
          return;
        }

        setCycle(cycleData);
        hasFetched.current = true;

        // Fetch notifications for the active cycle
        const notifResponse = await fetchWithAuth(
          `/api/notifications/${cycleData.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!notifResponse.ok) {
          const errorText = await notifResponse.text();
          console.error("Notifications fetch error:", {
            status: notifResponse.status,
            statusText: notifResponse.statusText,
            error: errorText,
          });
          if (notifResponse.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error(
            `HTTP error! status: ${notifResponse.status} - ${errorText}`
          );
        }

        const notifData = await notifResponse.json();
        console.log("Notifications data:", notifData);

        if (mounted.current) {
          setNotifications(notifData || []);
        }
      } catch (err) {
        if (!mounted.current) return;
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        if (mounted.current) {
          setLoading(false);
          setNotifLoading(false);
        }
      }
    };

    if (!token || !user) {
      setLoading(false);
      setError("Please log in to view notifications");
      return;
    }

    fetchData();

    return () => {
      mounted.current = false;
    };
  }, []); // Empty dependency array - only run on mount

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

  if (error || !cycle) {
    // If there's no cycle but also no error, show welcome message
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-white shadow-sm">
            <h1 className="text-3xl font-bold text-template mb-4">
              Welcome to CDP Portal
            </h1>
            <p className="text-lg text-center text-gray-600 mb-6">
              You are currently not registered in any placement cycle.
            </p>
            <p className="text-md text-center text-gray-500 max-w-md mb-8">
              Once you are registered in a placement cycle, you will be able to
              view notifications, job updates, and participate in the placement
              process here. Kindly fill your profile details in the profile
              section so that you can be verified by the placement cell and
              added to placement cycles.
            </p>
            <div className="text-sm text-muted-foreground text-center">
              Please contact your placement coordinator if you believe this is
              an error.
            </div>
          </div>
        </main>
      </div>
    );

    // Show error message for actual errors
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error || "An unexpected error occurred."}
            </p>
            {error === "Please log in to view notifications" && (
              <button
                onClick={() => router.push("/login")}
                className="text-template hover:underline"
              >
                Go to Login
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-16 py-8">
        <div className="space-y-8">
          {/* Cycle Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
          </div>

          {/* Notifications and Comments Section */}
          <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-template mb-4">
                  Latest Notifications
                </h2>
                <Separator className="mb-6" />
                <NotificationList
                  notifications={notifications}
                  loading={notifLoading}
                />
              </div>
            </div>
            <div>
              <CommentSection placementCycleId={cycle.id as string} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
