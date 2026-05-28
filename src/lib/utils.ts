import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as Tanzania Shillings (TZS). */
export function formatCurrency(amount: number, currency = "TZS"): string {
  const formatted = new Intl.NumberFormat("en-TZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `TZS ${formatted}`;
}

/** Compact format: TZS 1.5M, TZS 800K */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `TZS ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `TZS ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `TZS ${(amount / 1_000).toFixed(0)}K`;
  return `TZS ${amount}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    proposal_sent: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    negotiation: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    won: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    todo: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    planning: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    on_hold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    revision: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: "text-green-500",
    medium: "text-yellow-500",
    high: "text-orange-500",
    urgent: "text-red-500",
  };
  return colors[priority] ?? "text-gray-500";
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    manager: "Manager",
    sales_user: "Sales User",
    accounts_user: "Accounts User",
    hr_user: "HR User",
    support_user: "Support User",
    marketing_user: "Marketing User",
    operations_user: "Operations User",
    // legacy
    managing_director: "Managing Director",
    operations_manager: "Operations Manager",
    account_manager: "Account Manager",
    sales_team: "Sales",
    creative_team: "Creative",
    finance_team: "Finance",
    client: "Client",
    freelancer: "Freelancer",
  };
  return labels[role] ?? role;
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    super_admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    sales_user: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    accounts_user: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    hr_user: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    support_user: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    marketing_user: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    operations_user: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  };
  return colors[role] ?? "bg-gray-100 text-gray-700";
}
