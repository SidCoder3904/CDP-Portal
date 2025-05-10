import { Separator } from "@/components/ui/separator"
import { NotificationList } from "@/components/notification_list"
import { CommentSection } from "@/components/comment_section"

async function getNotifications(placementCycleId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/notifications/${placementCycleId}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export default async function NotificationPage() {
  // TODO: Get current placement cycle ID from context/state
  const placementCycleId = "current_cycle_id";
  const notifications = await getNotifications(placementCycleId);

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-template mb-4">Latest Notifications</h2>
              <Separator className="mb-6" />
              <NotificationList notifications={notifications} loading={false} />
            </div>
          </div>
          <div className="space-y-6">
            <CommentSection />
          </div>
        </div>
      </main>
    </div>
  )
}

