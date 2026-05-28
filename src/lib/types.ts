// ── Roles ────────────────────────────────────────────────────────────────────
export type UserRole =
  | "super_admin"
  | "admin"
  | "manager"
  | "sales_user"
  | "accounts_user"
  | "hr_user"
  | "support_user"
  | "marketing_user"
  | "operations_user"
  // legacy kept for compatibility
  | "managing_director"
  | "operations_manager"
  | "account_manager"
  | "sales_team"
  | "creative_team"
  | "finance_team"
  | "client"
  | "freelancer";

// ── Departments ───────────────────────────────────────────────────────────────
export type DepartmentId =
  | "administration"
  | "sales"
  | "accounts"
  | "hr"
  | "support"
  | "marketing"
  | "operations";

export interface Department {
  id: DepartmentId | string;
  name: string;
  description?: string;
  headId?: string;   // user id of department head
  memberCount: number;
  createdAt: string;
}

// ── Users ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // hashed in real app; plain for demo
  role: UserRole;
  avatar?: string;
  departmentId?: DepartmentId | string;
  department?: string;  // display label
  phone?: string;
  status: "active" | "inactive";
  joinedAt: string;
  lastLogin?: string;
}

// ── Tanzania-specific tax / company fields ────────────────────────────────────
export interface TanzaniaCompanyInfo {
  tin?: string;           // Tax Identification Number
  vrn?: string;           // VAT Registration Number
  brn?: string;           // Business Registration Number
}

// ── App-level settings (tenant config) ────────────────────────────────────────
export interface AppSettings {
  country: "TZ";
  currency: "TZS";
  currencySymbol: "TZS";
  timezone: "Africa/Dar_es_Salaam";
  locale: "en-TZ";
  dateFormat: "DD/MM/YYYY";
  vatEnabled: boolean;
  vatRate: number;          // default 18
  withholdingTaxRate: number; // default 5
  companyName: string;
  companyTIN: string;
  companyVRN: string;
  companyBRN: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogo?: string;
  invoicePrefix: string;   // e.g. "INV"
  quotationPrefix: string; // e.g. "QT"
  proformaPrefix: string;  // e.g. "PRO"
}

// ── RBAC ──────────────────────────────────────────────────────────────────────
export type Permission =
  | "dashboard:view"
  | "leads:view" | "leads:create" | "leads:edit" | "leads:delete"
  | "clients:view" | "clients:create" | "clients:edit" | "clients:delete"
  | "projects:view" | "projects:create" | "projects:edit" | "projects:delete"
  | "tasks:view" | "tasks:create" | "tasks:edit" | "tasks:delete"
  | "finance:view" | "finance:create" | "finance:edit" | "finance:delete"
  | "hr:view" | "hr:create" | "hr:edit" | "hr:delete"
  | "analytics:view"
  | "approvals:view" | "approvals:manage"
  | "communication:view"
  | "ai:view"
  | "admin:view" | "admin:users" | "admin:departments" | "admin:settings" | "admin:roles"
  | "campaigns:view" | "campaigns:create" | "campaigns:edit";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "dashboard:view",
    "leads:view","leads:create","leads:edit","leads:delete",
    "clients:view","clients:create","clients:edit","clients:delete",
    "projects:view","projects:create","projects:edit","projects:delete",
    "tasks:view","tasks:create","tasks:edit","tasks:delete",
    "finance:view","finance:create","finance:edit","finance:delete",
    "hr:view","hr:create","hr:edit","hr:delete",
    "analytics:view","approvals:view","approvals:manage",
    "communication:view","ai:view",
    "admin:view","admin:users","admin:departments","admin:settings","admin:roles",
    "campaigns:view","campaigns:create","campaigns:edit",
  ],
  admin: [
    "dashboard:view",
    "leads:view","leads:create","leads:edit",
    "clients:view","clients:create","clients:edit",
    "projects:view","projects:create","projects:edit",
    "tasks:view","tasks:create","tasks:edit",
    "finance:view","finance:create","finance:edit",
    "hr:view","hr:create","hr:edit",
    "analytics:view","approvals:view","approvals:manage",
    "communication:view","ai:view",
    "admin:view","admin:users","admin:departments",
    "campaigns:view","campaigns:create","campaigns:edit",
  ],
  manager: [
    "dashboard:view",
    "leads:view","leads:create","leads:edit",
    "clients:view","clients:create","clients:edit",
    "projects:view","projects:create","projects:edit",
    "tasks:view","tasks:create","tasks:edit",
    "finance:view",
    "hr:view",
    "analytics:view","approvals:view","approvals:manage",
    "communication:view","ai:view",
    "campaigns:view","campaigns:create","campaigns:edit",
  ],
  sales_user: [
    "dashboard:view",
    "leads:view","leads:create","leads:edit",
    "clients:view","clients:create",
    "projects:view",
    "tasks:view","tasks:create","tasks:edit",
    "communication:view",
    "campaigns:view",
    "approvals:view",
  ],
  accounts_user: [
    "dashboard:view",
    "clients:view",
    "projects:view",
    "finance:view","finance:create","finance:edit",
    "tasks:view","tasks:create","tasks:edit",
    "communication:view",
    "approvals:view","approvals:manage",
    "analytics:view",
  ],
  hr_user: [
    "dashboard:view",
    "hr:view","hr:create","hr:edit",
    "tasks:view","tasks:create","tasks:edit",
    "communication:view",
  ],
  support_user: [
    "dashboard:view",
    "clients:view",
    "tasks:view","tasks:create","tasks:edit",
    "communication:view",
    "approvals:view",
  ],
  marketing_user: [
    "dashboard:view",
    "leads:view","leads:create",
    "clients:view",
    "projects:view",
    "campaigns:view","campaigns:create","campaigns:edit",
    "tasks:view","tasks:create","tasks:edit",
    "communication:view","ai:view",
    "analytics:view",
    "approvals:view",
  ],
  operations_user: [
    "dashboard:view",
    "projects:view","projects:create","projects:edit",
    "tasks:view","tasks:create","tasks:edit",
    "clients:view",
    "communication:view",
    "approvals:view","approvals:manage",
    "analytics:view",
  ],
  // legacy
  managing_director: [
    "dashboard:view","leads:view","leads:create","leads:edit","leads:delete",
    "clients:view","clients:create","clients:edit","clients:delete",
    "projects:view","projects:create","projects:edit","projects:delete",
    "tasks:view","tasks:create","tasks:edit","tasks:delete",
    "finance:view","finance:create","finance:edit","finance:delete",
    "hr:view","hr:create","hr:edit",
    "analytics:view","approvals:view","approvals:manage",
    "communication:view","ai:view","admin:view",
    "campaigns:view","campaigns:create","campaigns:edit",
  ],
  operations_manager: [
    "dashboard:view","projects:view","projects:create","projects:edit",
    "tasks:view","tasks:create","tasks:edit","hr:view","hr:create",
    "communication:view","analytics:view","approvals:view","approvals:manage",
    "campaigns:view","campaigns:create",
  ],
  account_manager: [
    "dashboard:view","leads:view","leads:create","leads:edit",
    "clients:view","clients:create","clients:edit",
    "projects:view","projects:create","projects:edit",
    "tasks:view","tasks:create","tasks:edit",
    "finance:view","finance:create",
    "communication:view","approvals:view","campaigns:view",
  ],
  sales_team: [
    "dashboard:view","leads:view","leads:create","leads:edit",
    "clients:view","tasks:view","tasks:create","communication:view","campaigns:view",
  ],
  creative_team: [
    "dashboard:view","projects:view","tasks:view","tasks:create","tasks:edit",
    "communication:view","approvals:view","campaigns:view","campaigns:create",
  ],
  finance_team: [
    "dashboard:view","finance:view","finance:create","finance:edit",
    "clients:view","analytics:view","approvals:view","approvals:manage","communication:view",
  ],
  client: ["dashboard:view","projects:view","approvals:view"],
  freelancer: ["dashboard:view","tasks:view","tasks:create","tasks:edit","communication:view"],
};

export type LeadStatus = "new" | "contacted" | "proposal_sent" | "negotiation" | "won" | "lost";
export type LeadSource = "website" | "facebook" | "google_ads" | "whatsapp" | "referral" | "email" | "linkedin" | "other";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface Lead {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  industry: string;
  source: LeadSource;
  budget: number;
  status: LeadStatus;
  score: number;
  assignedTo: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
}

export interface Client {
  id: string;
  company: string;
  industry: string;
  contacts: ClientContact[];
  logo?: string;
  status: "active" | "inactive" | "prospect";
  retainerValue?: number;
  contractStart?: string;
  contractEnd?: string;
  accountManager: string;
  totalRevenue: number;
  tags: string[];
  createdAt: string;
  // Tanzania-specific
  tin?: string;
  vrn?: string;
  brn?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
}

export interface ClientContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
}

export type CampaignType =
  | "social_media"
  | "tv"
  | "radio"
  | "influencer"
  | "branding"
  | "digital"
  | "outdoor"
  | "event";

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "cancelled";

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  type: CampaignType;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  teamMembers: string[];
  description: string;
  tags: string[];
  tasks: Task[];
  createdAt: string;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  assignee: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  checklist: ChecklistItem[];
  attachments: string[];
  comments: number;
  tags: string[];
  timeLogged: number;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export type InvoiceType = "invoice" | "proforma" | "quotation";

export interface Invoice {
  id: string;
  number: string;
  type: InvoiceType;
  clientId: string;
  clientName: string;
  clientTIN?: string;
  clientVRN?: string;
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;        // percentage, e.g. 18
  vatAmount: number;      // computed: subtotal * vatRate/100
  withholdingTax?: number; // optional WHT
  total: number;          // subtotal + vatAmount - withholdingTax
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  terms?: string;
  createdBy?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  projectId?: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  receipt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "file" | "image" | "voice";
  timestamp: string;
  reactions?: Record<string, string[]>;
  isRead: boolean;
}

export interface Channel {
  id: string;
  name: string;
  type: "channel" | "dm" | "group";
  members: string[];
  lastMessage?: Message;
  unreadCount: number;
  icon?: string;
}

export interface Notification {
  id: string;
  type: "task" | "approval" | "lead" | "payment" | "mention" | "deadline" | "campaign";
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
  avatar?: string;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  type: "creative" | "campaign" | "budget" | "proposal" | "invoice";
  status: "pending" | "approved" | "rejected" | "revision";
  requestedBy: string;
  approver: string;
  projectId?: string;
  clientId?: string;
  files: string[];
  comments: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  phone: string;
  startDate: string;
  status: "active" | "on_leave" | "inactive";
  salary?: number;
  manager?: string;
  kpis: KPI[];
}

export interface KPI {
  name: string;
  target: number;
  actual: number;
  unit: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  activeClients: number;
  activeCampaigns: number;
  openLeads: number;
  pendingApprovals: number;
  teamProductivity: number;
  invoicesPending: number;
}
