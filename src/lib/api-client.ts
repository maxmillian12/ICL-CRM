import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";

// Use Next.js API routes (same origin) — no separate backend needed
const BASE_URL = "/api";

// ─── Token storage ────────────────────────────────────────────────────────────
const TOKEN_KEY = "icl_crm_token";

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string) => {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  },
  clear: () => {
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
  },
};

// ─── Axios instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string; code?: string; details?: string[] }>) => {
    if (error.response?.status === 401) {
      const code = error.response.data?.code;
      tokenStorage.clear();
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = `/login?reason=${code ?? "auth"}`;
      }
    }
    return Promise.reject(error);
  }
);

// ─── Helper to extract error message ─────────────────────────────────────────
export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; details?: string[] } | undefined;
    if (data?.details?.length) return data.details.join(". ");
    if (data?.error) return data.error;
    if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
      return "Cannot connect to server. Make sure the API is running.";
    }
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

export default api;

// ─── Typed API methods ────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: unknown }>("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post<{ token: string }>("/auth/refresh"),
};

export const usersApi = {
  list: () => api.get<{ data: unknown[]; total: number }>("/users"),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: Record<string, unknown>) => api.post("/users", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}`, data),
  updateStatus: (id: string, status: "active" | "inactive") => api.patch(`/users/${id}/status`, { status }),
  resetPassword: (id: string, password: string) => api.post(`/users/${id}/reset-password`, { password }),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const departmentsApi = {
  list: () => api.get<{ data: unknown[]; total: number }>("/departments"),
  get: (id: string) => api.get(`/departments/${id}`),
  create: (data: Record<string, unknown>) => api.post("/departments", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

export const settingsApi = {
  get: () => api.get("/settings"),
  update: (data: Record<string, unknown>) => api.put("/settings", data),
};

export const leadsApi = {
  list: (params?: Record<string, string>) =>
    api.get<{ data: unknown[]; total: number }>("/crm/leads", { params }),
  get: (id: string) => api.get(`/crm/leads/${id}`),
  create: (data: Record<string, unknown>) => api.post("/crm/leads", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/crm/leads/${id}`, data),
  delete: (id: string) => api.delete(`/crm/leads/${id}`),
  pipeline: () => api.get("/crm/leads/pipeline"),
};

export const clientsApi = {
  list: () => api.get<{ data: unknown[]; total: number }>("/clients"),
  get: (id: string) => api.get(`/clients/${id}`),
  create: (data: Record<string, unknown>) => api.post("/clients", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

export const projectsApi = {
  list: (params?: Record<string, string>) =>
    api.get<{ data: unknown[]; total: number }>("/projects", { params }),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: Record<string, unknown>) => api.post("/projects", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const tasksApi = {
  list: (params?: Record<string, string>) =>
    api.get<{ data: unknown[]; total: number }>("/tasks", { params }),
  get: (id: string) => api.get(`/tasks/${id}`),
  create: (data: Record<string, unknown>) => api.post("/tasks", data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/tasks/${id}`, data),
  updateChecklist: (taskId: string, itemId: string, done: boolean) =>
    api.patch(`/tasks/${taskId}/checklist/${itemId}`, { done }),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

export const financeApi = {
  listInvoices: (params?: Record<string, string>) =>
    api.get<{ data: unknown[]; total: number }>("/finance/invoices", { params }),
  getInvoice: (id: string) => api.get(`/finance/invoices/${id}`),
  createInvoice: (data: Record<string, unknown>) => api.post("/finance/invoices", data),
  updateInvoiceStatus: (id: string, status: string, paymentMethod?: string) =>
    api.patch(`/finance/invoices/${id}/status`, { status, payment_method: paymentMethod }),
  deleteInvoice: (id: string) => api.delete(`/finance/invoices/${id}`),
  listExpenses: () => api.get<{ data: unknown[]; total: number }>("/finance/expenses"),
  createExpense: (data: Record<string, unknown>) => api.post("/finance/expenses", data),
  approveExpense: (id: string) => api.patch(`/finance/expenses/${id}/approve`),
  rejectExpense: (id: string) => api.patch(`/finance/expenses/${id}/reject`),
  summary: () => api.get("/finance/summary"),
};

export const notificationsApi = {
  list: () => api.get("/notifications"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post("/notifications/mark-all-read"),
};

export const reportsApi = {
  dashboard: () => api.get("/reports/dashboard"),
  revenue: () => api.get("/reports/revenue"),
};

export const hrApi = {
  listEmployees: () => api.get<{ data: unknown[]; total: number }>("/hr/employees"),
  getEmployee: (id: string) => api.get(`/hr/employees/${id}`),
};
