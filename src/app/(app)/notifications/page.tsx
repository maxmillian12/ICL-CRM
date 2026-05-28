"use client";

import { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notifications as initialNotifications } from "@/lib/mock-data";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { Notification } from "@/lib/types";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, string> = {
  approval: "🔔", lead: "🎯", payment: "💰", deadline: "⏰", task: "✅", campaign: "📣", mention: "@",
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifications);

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));

  const unread = notifs.filter(n => !n.read);
  const read = notifs.filter(n => n.read);

  const NotifCard = ({ notif }: { notif: Notification }) => (
    <Card className={cn("border-border transition-all", !notif.read && "border-l-4 border-l-primary bg-primary/5")}>
      <CardContent className="p-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[notif.type] ?? "🔔"}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm", !notif.read && "font-semibold")}>{notif.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">{formatRelativeTime(notif.timestamp)}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {!notif.read && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markRead(notif.id)}>
              <Check className="w-3.5 h-3.5 text-green-500" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNotif(notif.id)}>
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="w-4 h-4 mr-2" />Mark all read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({notifs.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4 space-y-2">
          {notifs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No notifications</p>
            </div>
          ) : notifs.map(n => <NotifCard key={n.id} notif={n} />)}
        </TabsContent>
        <TabsContent value="unread" className="mt-4 space-y-2">
          {unread.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Check className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-60" />
              <p>All caught up!</p>
            </div>
          ) : unread.map(n => <NotifCard key={n.id} notif={n} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
