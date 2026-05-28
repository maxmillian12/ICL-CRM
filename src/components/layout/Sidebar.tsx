"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, FolderKanban, MessageSquare,
  BarChart3, Settings, ChevronLeft, ChevronRight, Megaphone,
  FileCheck, Bot, Bell, Building2, Menu, X, LogOut,
  Briefcase, Calendar, CheckSquare, Target, TrendingUp, Shield,
  Receipt,
} from "lucide-react";
import { cn, getInitials, getRoleLabel } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useApi } from "@/lib/use-api";
import { notificationsApi } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Permission } from "@/lib/types";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  permission?: Permission;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", permission: "dashboard:view" },
      { href: "/notifications", icon: Bell, label: "Notifications" },
    ],
  },
  {
    label: "Sales & CRM",
    items: [
      { href: "/crm/leads", icon: Target, label: "Leads", permission: "leads:view" },
      { href: "/crm/pipeline", icon: TrendingUp, label: "Sales Pipeline", permission: "leads:view" },
      { href: "/clients", icon: Building2, label: "Clients", permission: "clients:view" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/projects", icon: FolderKanban, label: "Projects", permission: "projects:view" },
      { href: "/campaigns", icon: Megaphone, label: "Campaigns", permission: "campaigns:view" },
      { href: "/tasks", icon: CheckSquare, label: "My Tasks", permission: "tasks:view" },
      { href: "/calendar", icon: Calendar, label: "Calendar", permission: "dashboard:view" },
      { href: "/approvals", icon: FileCheck, label: "Approvals", permission: "approvals:view" },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/communication", icon: MessageSquare, label: "Team Chat", permission: "communication:view" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/finance/invoices", icon: Receipt, label: "Invoices", permission: "finance:view" },
      { href: "/finance/expenses", icon: Briefcase, label: "Expenses", permission: "finance:view" },
      { href: "/finance/reports", icon: BarChart3, label: "Financial Reports", permission: "finance:view" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/hr", icon: Users, label: "Team & HR", permission: "hr:view" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/analytics", icon: TrendingUp, label: "Analytics", permission: "analytics:view" },
      { href: "/ai", icon: Bot, label: "AI Assistant", permission: "ai:view" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin", icon: Shield, label: "Admin Panel", permission: "admin:view" },
      { href: "/settings", icon: Settings, label: "Settings", permission: "dashboard:view" },
    ],
  },
];

// ── Extracted inner component to avoid "component created during render" error ─
interface SidebarInnerProps {
  collapsed: boolean;
  mobileOpen: boolean;
  setCollapsed: (v: boolean) => void;
  setMobileOpen: (v: boolean) => void;
  pathname: string;
  visibleGroups: NavGroup[];
  user: { name: string; role: string };
  unreadCount: number;
  logout: () => void;
}

function SidebarContent({
  collapsed, mobileOpen, setCollapsed, setMobileOpen,
  pathname, visibleGroups, user, unreadCount, logout,
}: SidebarInnerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* IC Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-4 border-b border-sidebar-border",
        collapsed && "justify-center px-2"
      )}>
        <div className="flex-shrink-0">
          <Image
            src="/ic-logo.png"
            alt="IC Logo"
            width={36}
            height={36}
            className="rounded-full"
          />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sidebar-foreground font-bold text-sm leading-tight tracking-wide">
              IC<span className="text-[#00AAEE]">L</span> CRM
            </p>
            <p className="text-sidebar-foreground/45 text-[10px]">Integrated Communication Ltd</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <p className="text-sidebar-foreground/40 text-[10px] font-semibold uppercase tracking-wider px-3 mb-1">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const badge = item.href === "/notifications" ? unreadCount : (item.badge ?? 0);
              const active = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 mb-0.5 group relative",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn(
                    "w-4 h-4 flex-shrink-0",
                    active
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                  )} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && badge > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-[10px] px-1.5 min-w-5 h-4 flex items-center justify-center">
                      {badge}
                    </Badge>
                  )}
                  {collapsed && badge > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Link>
              );
            })}
            {!collapsed && (
              <Separator className="bg-sidebar-border mt-2 mb-1 opacity-30" />
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className={cn(
        "border-t border-sidebar-border p-3",
        collapsed && "flex justify-center"
      )}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {getInitials(user.name)}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-sm font-medium truncate">{user.name}</p>
              <p className="text-sidebar-foreground/50 text-xs truncate">{getRoleLabel(user.role)}</p>
            </div>
            <button type="button" onClick={logout} title="Sign out" aria-label="Sign out">
              <LogOut className="w-4 h-4 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-sidebar-border rounded-full items-center justify-center hover:bg-sidebar-accent transition-colors z-10"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-sidebar-foreground" />
          : <ChevronLeft className="w-3 h-3 text-sidebar-foreground" />}
      </button>
    </div>
  );
}

// ── Main Sidebar export ───────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const { user, can, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: notifData } = useApi(
    () => notificationsApi.list().then(r => r.data),
    []
  );
  const unreadCount = (notifData as { unread?: number })?.unread ?? 0;

  if (!user) return null;

  const visibleGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => !item.permission || can(item.permission)),
  })).filter(group => group.items.length > 0);

  const innerProps: SidebarInnerProps = {
    collapsed, mobileOpen, setCollapsed, setMobileOpen,
    pathname, visibleGroups, user, unreadCount, logout,
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle mobile menu"
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-sidebar rounded-lg flex items-center justify-center shadow-lg"
      >
        {mobileOpen
          ? <X className="w-4 h-4 text-sidebar-foreground" />
          : <Menu className="w-4 h-4 text-sidebar-foreground" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "lg:hidden fixed left-0 top-0 h-full z-40 transition-transform duration-300 bg-sidebar w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent {...innerProps} />
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 h-full bg-sidebar transition-all duration-300 relative z-20",
        collapsed ? "w-16" : "w-60"
      )}>
        <SidebarContent {...innerProps} />
      </aside>
    </>
  );
}
