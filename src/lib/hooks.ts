"use client";

import useSWR, { mutate } from "swr";
import api, { getApiError } from "./api-client";
import { tokenStorage } from "./api-client";

// ── Generic typed hook ───────────────────────────────────────────────────────
export function useData<T>(url: string | null, options?: { refreshInterval?: number }) {
  const { data, error, isLoading, isValidating, mutate: revalidate } = useSWR<T>(
    url,
    options
  );
  return {
    data,
    loading: isLoading,
    validating: isValidating,
    error: error?.message ?? null,
    refetch: revalidate,
  };
}

// ── Global cache invalidation helpers ────────────────────────────────────────
export const revalidate = {
  leads: () => mutate((key: string) => typeof key === "string" && key.includes("/api/crm/leads")),
  clients: () => mutate((key: string) => typeof key === "string" && key.includes("/api/clients")),
  projects: () => mutate((key: string) => typeof key === "string" && key.includes("/api/projects")),
  tasks: () => mutate((key: string) => typeof key === "string" && key.includes("/api/tasks")),
  invoices: () => mutate((key: string) => typeof key === "string" && key.includes("/api/finance/invoices")),
  expenses: () => mutate((key: string) => typeof key === "string" && key.includes("/api/finance/expenses")),
  finance: () => mutate((key: string) => typeof key === "string" && key.includes("/api/finance")),
  users: () => mutate((key: string) => typeof key === "string" && key.includes("/api/users")),
  departments: () => mutate((key: string) => typeof key === "string" && key.includes("/api/departments")),
  notifications: () => mutate((key: string) => typeof key === "string" && key.includes("/api/notifications")),
  dashboard: () => mutate((key: string) => typeof key === "string" && key.includes("/api/reports")),
  settings: () => mutate("/api/settings"),
  all: () => mutate(() => true),
};

// ── Typed entity hooks ────────────────────────────────────────────────────────
export interface ListResponse<T> { data: T[]; total: number; }

export function useLeads(params?: Record<string, string>) {
  const search = params ? "?" + new URLSearchParams(params).toString() : "";
  return useData<ListResponse<Record<string, unknown>>>(`/api/crm/leads${search}`);
}

export function useLead(id: string | null) {
  return useData<Record<string, unknown>>(id ? `/api/crm/leads/${id}` : null);
}

export function useClients() {
  return useData<ListResponse<Record<string, unknown>>>("/api/clients");
}

export function useClient(id: string | null) {
  return useData<Record<string, unknown>>(id ? `/api/clients/${id}` : null);
}

export function useProjects(params?: Record<string, string>) {
  const search = params ? "?" + new URLSearchParams(params).toString() : "";
  return useData<ListResponse<Record<string, unknown>>>(`/api/projects${search}`);
}

export function useProject(id: string | null) {
  return useData<Record<string, unknown>>(id ? `/api/projects/${id}` : null);
}

export function useTasks(params?: Record<string, string>) {
  const search = params ? "?" + new URLSearchParams(params).toString() : "";
  return useData<ListResponse<Record<string, unknown>>>(`/api/tasks${search}`);
}

export function useInvoices(params?: Record<string, string>) {
  const search = params ? "?" + new URLSearchParams(params).toString() : "";
  return useData<ListResponse<Record<string, unknown>>>(`/api/finance/invoices${search}`);
}

export function useExpenses() {
  return useData<ListResponse<Record<string, unknown>>>("/api/finance/expenses");
}

export function useFinanceSummary() {
  return useData<Record<string, number>>("/api/finance/summary");
}

export function useUsers() {
  return useData<ListResponse<Record<string, unknown>>>("/api/users");
}

export function useDepartments() {
  return useData<ListResponse<Record<string, unknown>>>("/api/departments");
}

export function useSettings() {
  return useData<Record<string, unknown>>("/api/settings");
}

export function useNotifications() {
  return useData<{ data: Record<string, unknown>[]; unread: number }>(
    "/api/notifications",
    { refreshInterval: 15000 }  // poll every 15s for notifications
  );
}

export function useDashboard() {
  return useData<Record<string, unknown>>("/api/reports/dashboard");
}

export function useRevenue() {
  return useData<Record<string, unknown>[]>("/api/reports/revenue");
}

export function useEmployees() {
  return useData<ListResponse<Record<string, unknown>>>("/api/hr/employees");
}

// ── Mutation helpers (optimistic UI + cache invalidation) ────────────────────
async function apiFetch(method: string, url: string, body?: unknown) {
  const token = tokenStorage.get();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

export const mutations = {
  // Leads
  createLead: async (data: Record<string, unknown>) => {
    const result = await apiFetch("POST", "/api/crm/leads", data);
    await revalidate.leads();
    await revalidate.dashboard();
    return result;
  },
  updateLead: async (id: string, data: Record<string, unknown>) => {
    const result = await apiFetch("PATCH", `/api/crm/leads/${id}`, data);
    await revalidate.leads();
    return result;
  },
  deleteLead: async (id: string) => {
    const result = await apiFetch("DELETE", `/api/crm/leads/${id}`);
    await revalidate.leads();
    await revalidate.dashboard();
    return result;
  },

  // Clients
  createClient: async (data: Record<string, unknown>) => {
    const result = await apiFetch("POST", "/api/clients", data);
    await revalidate.clients();
    await revalidate.dashboard();
    return result;
  },
  updateClient: async (id: string, data: Record<string, unknown>) => {
    const result = await apiFetch("PATCH", `/api/clients/${id}`, data);
    await revalidate.clients();
    return result;
  },
  deleteClient: async (id: string) => {
    const result = await apiFetch("DELETE", `/api/clients/${id}`);
    await revalidate.clients();
    await revalidate.dashboard();
    return result;
  },

  // Projects
  createProject: async (data: Record<string, unknown>) => {
    const result = await apiFetch("POST", "/api/projects", data);
    await revalidate.projects();
    await revalidate.dashboard();
    return result;
  },
  updateProject: async (id: string, data: Record<string, unknown>) => {
    const result = await apiFetch("PATCH", `/api/projects/${id}`, data);
    await revalidate.projects();
    return result;
  },
  deleteProject: async (id: string) => {
    const result = await apiFetch("DELETE", `/api/projects/${id}`);
    await revalidate.projects();
    await revalidate.dashboard();
    return result;
  },

  // Tasks
  createTask: async (data: Record<string, unknown>) => {
    const result = await apiFetch("POST", "/api/tasks", data);
    await revalidate.tasks();
    return result;
  },
  updateTask: async (id: string, data: Record<string, unknown>) => {
    const result = await apiFetch("PATCH", `/api/tasks/${id}`, data);
    await revalidate.tasks();
    return result;
  },
  deleteTask: async (id: string) => {
    const result = await apiFetch("DELETE", `/api/tasks/${id}`);
    await revalidate.tasks();
    return result;
  },

  // Invoices
  createInvoice: async (data: Record<string, unknown>) => {
    const result = await apiFetch("POST", "/api/finance/invoices", data);
    await revalidate.invoices();
    await revalidate.finance();
    await revalidate.dashboard();
    return result;
  },
  updateInvoiceStatus: async (id: string, status: string, paymentMethod?: string) => {
    const result = await apiFetch("PATCH", `/api/finance/invoices/${id}/status`, { status, payment_method: paymentMethod });
    await revalidate.invoices();
    await revalidate.finance();
    await revalidate.dashboard();
    return result;
  },
  deleteInvoice: async (id: string) => {
    const result = await apiFetch("DELETE", `/api/finance/invoices/${id}`);
    await revalidate.invoices();
    await revalidate.finance();
    return result;
  },

  // Expenses
  createExpense: async (data: Record<string, unknown>) => {
    const result = await apiFetch("POST", "/api/finance/expenses", data);
    await revalidate.expenses();
    return result;
  },
  approveExpense: async (id: string) => {
    const result = await apiFetch("PATCH", `/api/finance/expenses/${id}/approve`);
    await revalidate.expenses();
    return result;
  },
  rejectExpense: async (id: string) => {
    const result = await apiFetch("PATCH", `/api/finance/expenses/${id}/reject`);
    await revalidate.expenses();
    return result;
  },

  // Users
  createUser: async (data: Record<string, unknown>) => {
    const result = await apiFetch("POST", "/api/users", data);
    await revalidate.users();
    return result;
  },
  updateUser: async (id: string, data: Record<string, unknown>) => {
    const result = await apiFetch("PATCH", `/api/users/${id}`, data);
    await revalidate.users();
    return result;
  },
  toggleUserStatus: async (id: string, status: "active" | "inactive") => {
    const result = await apiFetch("PATCH", `/api/users/${id}/status`, { status });
    await revalidate.users();
    return result;
  },
  resetPassword: async (id: string, password: string) => {
    return apiFetch("POST", `/api/users/${id}/reset-password`, { password });
  },
  deleteUser: async (id: string) => {
    const result = await apiFetch("DELETE", `/api/users/${id}`);
    await revalidate.users();
    return result;
  },

  // Departments
  createDepartment: async (data: Record<string, unknown>) => {
    const result = await apiFetch("POST", "/api/departments", data);
    await revalidate.departments();
    return result;
  },
  updateDepartment: async (id: string, data: Record<string, unknown>) => {
    const result = await apiFetch("PATCH", `/api/departments/${id}`, data);
    await revalidate.departments();
    return result;
  },
  deleteDepartment: async (id: string) => {
    const result = await apiFetch("DELETE", `/api/departments/${id}`);
    await revalidate.departments();
    return result;
  },

  // Settings
  updateSettings: async (data: Record<string, unknown>) => {
    const result = await apiFetch("PUT", "/api/settings", data);
    await revalidate.settings();
    return result;
  },

  // Notifications
  markRead: async (id: string) => {
    const result = await apiFetch("PATCH", `/api/notifications/${id}/read`);
    await revalidate.notifications();
    return result;
  },
  markAllRead: async () => {
    const result = await apiFetch("POST", "/api/notifications/mark-all-read");
    await revalidate.notifications();
    return result;
  },
};
