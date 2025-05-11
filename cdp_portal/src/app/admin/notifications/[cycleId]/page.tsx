"use client";
import { useEffect, useState } from "react";
import { NotificationListAdmin } from "@/components/notification_list_admin";
import { CommentSectionAdmin } from "@/components/comment_section_admin";
import { AddNotificationButton } from "@/components/add_notification_button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useApi } from "@/lib/api";

interface Cycle {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function CycleNotificationsPage({ params }: { params: { cycleId: string } }) {
  const { fetchWithAuth } = useApi();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCycle = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(`/api/placement-cycles/${params.cycleId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCycle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchCycle();
  }, [params.cycleId, fetchWithAuth]);

  useEffect(() => {
    if (!cycle?.id) return;
    const fetchNotifications = async () => {
      setNotifLoading(true);
      try {
        const response = await fetchWithAuth(`/api/admin/notifications?placement_cycle_id=${cycle.id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setNotifLoading(false);
      }
    };
    fetchNotifications();
  }, [cycle?.id, fetchWithAuth]);

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
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground text-center mb-4">{error || 'Cycle not found.'}</p>
            <Link href="/admin">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cycles
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
          {/* Cycle Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cycles
              </Link>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">{cycle.name}</h1>
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
              <p className="text-muted-foreground mt-1">
                {cycle.type} • {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-template">
                  Recent Notifications
                </h2>
                <AddNotificationButton placementCycleId={""} />
              </div>
              <div>
                <NotificationListAdmin notifications={notifications} loading={notifLoading} onNotificationChange={function (): void {
                  throw new Error("Function not implemented.");
                } } />
              </div>
            </div>
            <div>
              <CommentSectionAdmin placementCycleId={""} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 