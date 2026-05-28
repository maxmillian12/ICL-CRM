"use client";

import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoader, ApiError } from "@/components/ui/loading";
import { useNotifications, mutations } from "@/lib/hooks";
import { formatRelativeTime, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

const TYPE_ICONS: Record<string,string> = { approval:"🔔",lead:"🎯",payment:"💰",deadline:"⏰",task:"✅",campaign:"📣",mention:"@",system:"💡" };

export default function NotificationsPage() {
  const { data, loading, error, refetch } = useNotifications();
  const [markingAll, setMarkingAll] = useState(false);
  const allNotifs = (data?.data ?? []) as Array<Record<string,unknown>>;
  const unread = allNotifs.filter(n => !n.read);

  const markRead = async (id: string) => {
    try { await mutations.markRead(id); }
    catch { /* silent */ }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try { await mutations.markAllRead(); toast.success("All marked as read"); }
    catch { toast.error("Failed"); }
    finally { setMarkingAll(false); }
  };

  const NotifCard = ({ notif }: { notif: Record<string,unknown> }) => (
    <Card className={cn("border-border transition-all cursor-pointer hover:shadow-sm",!notif.read&&"border-l-4 border-l-primary bg-primary/5")}
      onClick={()=>markRead(notif.id as string)}>
      <CardContent className="p-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[notif.type as string]??"🔔"}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm",!notif.read&&"font-semibold")}>{notif.title as string}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{notif.message as string}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">{formatRelativeTime(notif.created_at as string)}</p>
        </div>
        {!notif.read&&<div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"/>}
      </CardContent>
    </Card>
  );

  if (loading && !data) return <PageLoader message="Loading notifications..."/>;
  if (error) return <div className="p-6"><ApiError error={error} onRetry={refetch}/></div>;

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground text-sm">{unread.length} unread · auto-refreshes every 15s</p></div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={markingAll}>
            {markingAll?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Marking...</>:<><Check className="w-4 h-4 mr-2"/>Mark all read</>}
          </Button>
        )}
      </div>
      <Tabs defaultValue="all">
        <TabsList><TabsTrigger value="all">All ({allNotifs.length})</TabsTrigger><TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger></TabsList>
        <TabsContent value="all" className="mt-4 space-y-2">
          {allNotifs.length===0?(
            <div className="text-center py-16 text-muted-foreground"><Bell className="w-8 h-8 mx-auto mb-2 opacity-40"/><p>No notifications yet</p></div>
          ):(allNotifs as Array<Record<string,unknown>>).map(n=><NotifCard key={n.id as string} notif={n}/>)}
        </TabsContent>
        <TabsContent value="unread" className="mt-4 space-y-2">
          {unread.length===0?(
            <div className="text-center py-16 text-muted-foreground"><Check className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-60"/><p className="font-medium">All caught up!</p></div>
          ):(unread as Array<Record<string,unknown>>).map(n=><NotifCard key={n.id as string} notif={n}/>)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
