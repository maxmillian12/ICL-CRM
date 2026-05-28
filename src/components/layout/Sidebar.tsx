"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, FolderKanban, MessageSquare, DollarSign,
  BarChart3, Settings, ChevronLeft, ChevronRight, Megaphone,
  UserCheck, FileCheck, Bot, Bell, Building2, Menu, X, LogOut,
  Briefcase, Calendar, CheckSquare, Target, TrendingUp, Shield,
  Receipt, FileText
} from "lucide-react";
import { cn, getInitials, getRoleLabel } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notifications } from "@/lib/mock-data";
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
      { href: "/notifications", icon: Bell, label: "Notifications", badge: notifications.filter(n => !n.read).length },
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
      { href: "/approvals", icon: FileCheck, label: "Approvals", permission: "approvals:view", badge: 2 },
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

export function Sidebar() {
  const pathname = usePathname();
  const { user, can } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't render sidebar content until user is loaded
  if (!user) return null;

  const visibleGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      !item.permission || can(item.permission)
    ),
  })).filter(group => group.items.length > 0);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <UserCheck className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sidebar-foreground font-bold text-sm leading-tight">ICL CRM</p>
            <p className="text-sidebar-foreground/50 text-xs">Tanzania</p>
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
                  {!collapsed && item.badge && item.badge > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-[10px] px-1.5 min-w-5 h-4 flex items-center justify-center">
                      {item.badge}
                    </Badge>
                  )}
                  {collapsed && item.badge && item.badge > 0 && (
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
            <LogOut className="w-4 h-4 text-sidebar-foreground/40 hover:text-sidebar-foreground cursor-pointer flex-shrink-0" />
          </div>
        )}
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-sidebar-border rounded-full items-center justify-center hover:bg-sidebar-accent transition-colors z-10"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-sidebar-foreground" />
          : <ChevronLeft className="w-3 h-3 text-sidebar-foreground" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
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
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 h-full bg-sidebar transition-all duration-300 relative z-20",
        collapsed ? "w-16" : "w-60"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
