"use client";

import { Bell, Check, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoader, ApiError } from "@/components/ui/loading";
import { useApi } from "@/lib/use-api";
import { notificationsApi, getApiError } from "@/lib/api-client";
import { formatRelativeTime, cn } from "@/lib/utils";
import { toast } from "sonner";

const TYPE_ICONS: Record<string,string> = { approval:"🔔",lead:"🎯",payment:"💰",deadline:"⏰",task:"✅",campaign:"📣",mention:"@",system:"💡" };

export default function NotificationsPage() {
  const { data, loading, error, refetch } = useApi(() => notificationsApi.list().then(r => r.data), []);
  const allNotifs = (data as {data?: unknown[]})?.data ?? [] as Array<Record<string,unknown>>;
  const unread = allNotifs.filter(n => !(n as Record<string,unknown>).read);

  const markRead = async (id: string) => {
    try { await notificationsApi.markRead(id); refetch(); }
    catch (err) { toast.error(getApiError(err)); }
  };
  const markAllRead = async () => {
    try { await notificationsApi.markAllRead(); toast.success("All marked as read"); refetch(); }
    catch (err) { toast.error(getApiError(err)); }
  };

  const NotifCard = ({ notif }: { notif: Record<string,unknown> }) => (
    <Card className={cn("border-border transition-all", !Boolean(notif.read) && "border-l-4 border-l-primary bg-primary/5")}>
      <CardContent className="p-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[notif.type as string] ?? "🔔"}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm", !Boolean(notif.read) && "font-semibold")}>{notif.title as string}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{notif.message as string}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">{formatRelativeTime(notif.created_at as string)}</p>
        </div>
        {!Boolean(notif.read) && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markRead(notif.id as string)}>
            <Check className="w-3.5 h-3.5 text-green-500" />
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) return <PageLoader message="Loading notifications..." />;
  if (error) return <div className="p-6"><ApiError error={error} onRetry={refetch} /></div>;

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
          <TabsTrigger value="all">All ({allNotifs.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4 space-y-2">
          {allNotifs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground"><Bell className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>No notifications</p></div>
          ) : (allNotifs as Array<Record<string,unknown>>).map(n => <NotifCard key={n.id as string} notif={n} />)}
        </TabsContent>
        <TabsContent value="unread" className="mt-4 space-y-2">
          {unread.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground"><Check className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-60" /><p>All caught up!</p></div>
          ) : (unread as Array<Record<string,unknown>>).map(n => <NotifCard key={n.id as string} notif={n} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
