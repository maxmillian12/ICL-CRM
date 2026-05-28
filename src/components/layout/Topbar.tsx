"use client";

import { useState } from "react";
import { Bell, Search, Sun, Moon, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, getInitials, formatRelativeTime } from "@/lib/utils";
import { notifications as mockNotifications } from "@/lib/mock-data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function Topbar() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(false);
  const router = useRouter();
  const unread = mockNotifications.filter((n) => !n.read);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const notifIcons: Record<string, string> = {
    approval: "🔔", lead: "👤", payment: "💰",
    deadline: "⏰", task: "✅", campaign: "📣", mention: "@",
  };

  return (
    <header className="sticky top-0 z-10 h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 gap-3">
      {/* Search */}
      <div className="flex-1 max-w-md ml-10 lg:ml-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clients, projects, tasks..."
            className="pl-9 h-9 bg-muted/50 border-transparent focus:border-border text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Quick Add — trigger styled directly, no nested <Button> */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push("/crm/leads?new=1")}>New Lead</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/clients?new=1")}>New Client</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/projects?new=1")}>New Project</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/tasks?new=1")}>New Task</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/finance/invoices?new=1")}>New Invoice</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dark mode */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDark}>
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications — PopoverTrigger styled directly */}
        <Popover>
          <PopoverTrigger
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Bell className="w-4 h-4" />
            {unread.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unread.length > 0 && (
                <Badge variant="secondary" className="text-xs">{unread.length} new</Badge>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {mockNotifications.slice(0, 6).map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors",
                    !notif.read && "bg-primary/5"
                  )}
                >
                  <span className="text-lg flex-shrink-0">{notifIcons[notif.type] ?? "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !notif.read && "font-medium")}>{notif.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{formatRelativeTime(notif.timestamp)}</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <div className="p-3 border-t">
              <Link
                href="/notifications"
                className="flex w-full items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                View all notifications
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* User — DropdownMenuTrigger styled directly */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-8 items-center gap-2 rounded-lg px-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="w-6 h-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                {getInitials(user?.name ?? "?")}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{user?.name?.split(" ")[0] ?? "..."}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
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
