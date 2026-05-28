"use client";

import { useState } from "react";
import { Bell, Search, Sun, Moon, Plus, ChevronDown, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, getInitials, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useNotifications, mutations } from "@/lib/hooks";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, string> = {
  approval: "🔔", lead: "🎯", payment: "💰",
  deadline: "⏰", task: "✅", campaign: "📣", mention: "@", system: "💡",
};

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);

  const { data: notifData } = useNotifications();
  const notifications = notifData?.data ?? [];
  const unreadCount = notifData?.unread ?? 0;

  const toggleDark = () => {
    setDark(d => !d);
    document.documentElement.classList.toggle("dark");
  };

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    try { await mutations.markAllRead(); }
    catch { toast.error("Failed to mark as read"); }
    finally { setMarkingRead(false); }
  };

  return (
    <header className="sticky top-0 z-10 h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 gap-3">
      <div className="flex-1 max-w-md ml-10 lg:ml-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clients, projects, tasks..." className="pl-9 h-9 bg-muted/50 border-transparent focus:border-border text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none">
            <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">New</span><ChevronDown className="w-3 h-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push("/crm/leads")}>New Lead</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/clients")}>New Client</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/projects")}>New Project</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/tasks")}>New Task</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/finance/invoices")}>New Invoice</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDark} aria-label="Toggle dark mode">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Popover>
          <PopoverTrigger aria-label="Notifications" className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>}
                {unreadCount > 0 && (
                  <button type="button" onClick={handleMarkAllRead} disabled={markingRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                    {markingRead ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}All read
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mb-2 opacity-30" /><p className="text-sm">No notifications</p>
                </div>
              ) : notifications.slice(0, 8).map((n) => (
                <div key={n.id as string} onClick={() => mutations.markRead(n.id as string).catch(()=>{})}
                  className={cn("flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors",!n.read && "bg-primary/5")}>
                  <span className="text-lg flex-shrink-0">{TYPE_ICONS[n.type as string] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm",!n.read && "font-medium")}>{n.title as string}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.message as string}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{formatRelativeTime(n.created_at as string)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <div className="p-3 border-t">
              <Link href="/notifications" className="flex w-full items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">View all</Link>
            </div>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-sm font-medium hover:bg-muted focus-visible:outline-none">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">{getInitials(user?.name ?? "?")}</div>
            <span className="hidden sm:inline">{user?.name?.split(" ")[0] ?? "..."}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2"><p className="text-sm font-medium">{user?.name}</p><p className="text-xs text-muted-foreground">{user?.email}</p></div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>My Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={logout}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
