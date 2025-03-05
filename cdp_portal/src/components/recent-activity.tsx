import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      user: { name: "Admin", avatar: "A" },
      action: "added a new job",
      target: "Software Engineer at Google",
      time: "2 hours ago",
    },
    {
      id: 2,
      user: { name: "Admin", avatar: "A" },
      action: "updated status for",
      target: "25 students in Microsoft hiring",
      time: "5 hours ago",
    },
    {
      id: 3,
      user: { name: "Admin", avatar: "A" },
      action: "created a new cycle",
      target: "Internship Cycle 2024",
      time: "1 day ago",
    },
    {
      id: 4,
      user: { name: "Admin", avatar: "A" },
      action: "exported data for",
      target: "Amazon recruitment drive",
      time: "2 days ago",
    },
  ];

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={activity.user.name} />
            <AvatarFallback>{activity.user.avatar}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              {activity.action}{" "}
              <span className="font-medium">{activity.target}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
