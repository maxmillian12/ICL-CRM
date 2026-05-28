import type {
  User, Lead, Client, Project, Task, Invoice, Expense,
  Channel, Message, Notification, Employee, DashboardStats,
  ApprovalRequest, Department, AppSettings
} from "./types";

// ── App Settings (Tanzania) ───────────────────────────────────────────────────
export const appSettings: AppSettings = {
  country: "TZ",
  currency: "TZS",
  currencySymbol: "TZS",
  timezone: "Africa/Dar_es_Salaam",
  locale: "en-TZ",
  dateFormat: "DD/MM/YYYY",
  vatEnabled: true,
  vatRate: 18,
  withholdingTaxRate: 5,
  companyName: "Integrated Communication Limited",
  companyTIN: "100-123-456",
  companyVRN: "40-012345-X",
  companyBRN: "2019/123456",
  companyAddress: "Plot 25, Kinondoni Road, Dar es Salaam",
  companyPhone: "+255 22 123 4567",
  companyEmail: "info@integrated.co.tz",
  invoicePrefix: "INV",
  quotationPrefix: "QT",
  proformaPrefix: "PRO",
};

// ── Departments ───────────────────────────────────────────────────────────────
export const departments: Department[] = [
  { id: "administration", name: "Administration", description: "Executive and administrative operations", headId: "u_geofrey", memberCount: 2, createdAt: "2024-01-01" },
  { id: "sales", name: "Sales", description: "Sales and business development", headId: "u3", memberCount: 3, createdAt: "2024-01-01" },
  { id: "accounts", name: "Accounts", description: "Finance, invoicing and accounting", headId: "u5", memberCount: 2, createdAt: "2024-01-01" },
  { id: "hr", name: "HR", description: "Human resources and people management", headId: "u6", memberCount: 1, createdAt: "2024-01-01" },
  { id: "support", name: "Support", description: "Client support and customer success", headId: "u2", memberCount: 2, createdAt: "2024-01-01" },
  { id: "marketing", name: "Marketing", description: "Marketing, creative and campaigns", headId: "u4", memberCount: 3, createdAt: "2024-01-01" },
  { id: "operations", name: "Operations", description: "Project delivery and operations", headId: "u6", memberCount: 2, createdAt: "2024-01-01" },
];

// ── Users ─────────────────────────────────────────────────────────────────────
export const superAdminUser: User = {
  id: "u_geofrey",
  name: "Geofrey Maxmillian",
  email: "geofrey@integrated.co.tz",
  password: "555556",
  role: "super_admin",
  departmentId: "administration",
  department: "Administration",
  phone: "+255 712 000 001",
  status: "active",
  joinedAt: "2024-01-01",
  lastLogin: "2026-05-28T08:00:00",
};

export const currentUser: User = superAdminUser;

export const users: User[] = [
  superAdminUser,
  {
    id: "u_admin",
    name: "Sarah Mensah",
    email: "sarah@integrated.co.tz",
    password: "admin123",
    role: "admin",
    departmentId: "administration",
    department: "Administration",
    phone: "+255 712 000 002",
    status: "active",
    joinedAt: "2022-01-15",
    lastLogin: "2026-05-28T07:30:00",
  },
  {
    id: "u2",
    name: "Kwame Asante",
    email: "kwame@integrated.co.tz",
    password: "user123",
    role: "manager",
    departmentId: "support",
    department: "Support",
    phone: "+255 712 000 003",
    status: "active",
    joinedAt: "2022-03-10",
  },
  {
    id: "u3",
    name: "Ama Boateng",
    email: "ama@integrated.co.tz",
    password: "user123",
    role: "sales_user",
    departmentId: "sales",
    department: "Sales",
    phone: "+255 712 000 004",
    status: "active",
    joinedAt: "2022-06-01",
  },
  {
    id: "u4",
    name: "Kofi Darko",
    email: "kofi@integrated.co.tz",
    password: "user123",
    role: "marketing_user",
    departmentId: "marketing",
    department: "Marketing",
    phone: "+255 712 000 005",
    status: "active",
    joinedAt: "2023-01-20",
  },
  {
    id: "u5",
    name: "Abena Osei",
    email: "abena@integrated.co.tz",
    password: "user123",
    role: "accounts_user",
    departmentId: "accounts",
    department: "Accounts",
    phone: "+255 712 000 006",
    status: "active",
    joinedAt: "2022-09-15",
  },
  {
    id: "u6",
    name: "Yaw Amponsah",
    email: "yaw@integrated.co.tz",
    password: "user123",
    role: "operations_user",
    departmentId: "operations",
    department: "Operations",
    phone: "+255 712 000 007",
    status: "active",
    joinedAt: "2021-11-05",
  },
  {
    id: "u7",
    name: "Grace Mwangi",
    email: "grace@integrated.co.tz",
    password: "user123",
    role: "hr_user",
    departmentId: "hr",
    department: "HR",
    phone: "+255 712 000 008",
    status: "active",
    joinedAt: "2023-04-01",
  },
  {
    id: "u8",
    name: "Daniel Kimaro",
    email: "daniel@integrated.co.tz",
    password: "user123",
    role: "support_user",
    departmentId: "support",
    department: "Support",
    phone: "+255 712 000 009",
    status: "inactive",
    joinedAt: "2023-07-15",
  },
];

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export const dashboardStats: DashboardStats = {
  totalRevenue: 485000000,
  revenueGrowth: 12.5,
  activeClients: 34,
  activeCampaigns: 18,
  openLeads: 47,
  pendingApprovals: 9,
  teamProductivity: 84,
  invoicesPending: 125000000,
};

// ── Revenue Chart Data (TZS) ──────────────────────────────────────────────────
export const revenueData = [
  { month: "Jan", revenue: 38000000, expenses: 22000000, profit: 16000000 },
  { month: "Feb", revenue: 42000000, expenses: 24000000, profit: 18000000 },
  { month: "Mar", revenue: 35000000, expenses: 21000000, profit: 14000000 },
  { month: "Apr", revenue: 51000000, expenses: 28000000, profit: 23000000 },
  { month: "May", revenue: 48000000, expenses: 26000000, profit: 22000000 },
  { month: "Jun", revenue: 62000000, expenses: 31000000, profit: 31000000 },
  { month: "Jul", revenue: 58000000, expenses: 30000000, profit: 28000000 },
  { month: "Aug", revenue: 71000000, expenses: 35000000, profit: 36000000 },
  { month: "Sep", revenue: 67000000, expenses: 33000000, profit: 34000000 },
  { month: "Oct", revenue: 75000000, expenses: 38000000, profit: 37000000 },
  { month: "Nov", revenue: 82000000, expenses: 40000000, profit: 42000000 },
  { month: "Dec", revenue: 91000000, expenses: 44000000, profit: 47000000 },
];

export const campaignPerformanceData = [
  { name: "Social Media", value: 35, color: "#3b82f6" },
  { name: "Digital Ads", value: 25, color: "#10b981" },
  { name: "TV", value: 20, color: "#f59e0b" },
  { name: "Influencer", value: 12, color: "#8b5cf6" },
  { name: "Outdoor", value: 8, color: "#ef4444" },
];

export const leadConversionData = [
  { stage: "New Leads", count: 120 },
  { stage: "Contacted", count: 85 },
  { stage: "Proposal", count: 52 },
  { stage: "Negotiation", count: 28 },
  { stage: "Won", count: 18 },
];

// ── Leads (TZS budgets) ───────────────────────────────────────────────────────
export const leads: Lead[] = [
  {
    id: "l1", company: "Azam Media Limited", contact: "Emmanuel Agyei",
    email: "e.agyei@azam.co.tz", phone: "+255 22 123 4567",
    industry: "Media & Broadcasting", source: "linkedin", budget: 50000000,
    status: "negotiation", score: 82, assignedTo: "u3",
    tags: ["high-value", "Q4"], notes: "Interested in full rebranding + digital campaign",
    createdAt: "2026-05-01", updatedAt: "2026-05-20", lastActivity: "2026-05-20",
  },
  {
    id: "l2", company: "Shoppers Plaza Tanzania", contact: "Diana Oppong",
    email: "d.oppong@shoppers.co.tz", phone: "+255 22 234 5678",
    industry: "Retail", source: "referral", budget: 75000000,
    status: "proposal_sent", score: 75, assignedTo: "u2",
    tags: ["retail", "campaign"], notes: "Wants 6-month OOH + social media package",
    createdAt: "2026-04-22", updatedAt: "2026-05-18", lastActivity: "2026-05-18",
  },
  {
    id: "l3", company: "Vodacom Tanzania", contact: "Joseph Nkrumah",
    email: "j.nkrumah@vodacom.co.tz", phone: "+255 74 345 6789",
    industry: "Telecom", source: "website", budget: 120000000,
    status: "contacted", score: 90, assignedTo: "u3",
    tags: ["enterprise", "telecom"], notes: "Looking for end-to-end campaign management",
    createdAt: "2026-05-10", updatedAt: "2026-05-22", lastActivity: "2026-05-22",
  },
  {
    id: "l4", company: "Tanzania Breweries Ltd", contact: "Grace Owusu",
    email: "g.owusu@tbl.co.tz", phone: "+255 22 456 7890",
    industry: "FMCG", source: "google_ads", budget: 20000000,
    status: "new", score: 45, assignedTo: "u3",
    tags: ["fmcg", "awareness"], notes: "Awareness campaign for new product line",
    createdAt: "2026-05-25", updatedAt: "2026-05-25",
  },
  {
    id: "l5", company: "NMB Bank Tanzania", contact: "Michael Tetteh",
    email: "m.tetteh@nmbtz.com", phone: "+255 22 567 8901",
    industry: "Banking", source: "facebook", budget: 85000000,
    status: "won", score: 95, assignedTo: "u2",
    tags: ["banking", "digital"], notes: "Signed 12-month retainer for digital marketing",
    createdAt: "2026-03-15", updatedAt: "2026-05-01", lastActivity: "2026-05-01",
  },
  {
    id: "l6", company: "CRDB Bank Plc", contact: "Nana Akua Asante",
    email: "n.asante@crdb.com", phone: "+255 22 678 9012",
    industry: "Banking", source: "referral", budget: 35000000,
    status: "lost", score: 30, assignedTo: "u3",
    tags: ["banking"], notes: "Budget constraints, revisit Q1 2027",
    createdAt: "2026-02-10", updatedAt: "2026-04-20",
  },
];

// ── Clients (Tanzania, with TIN/VRN/BRN) ─────────────────────────────────────
export const clients: Client[] = [
  {
    id: "c1", company: "NMB Bank Tanzania", industry: "Banking",
    tin: "100-234-567", vrn: "40-023456-X", brn: "2010/098765",
    address: "NMB House, Sokoine Drive", city: "Dar es Salaam", region: "Dar es Salaam", country: "Tanzania",
    contacts: [
      { id: "cc1", name: "Michael Tetteh", email: "m.tetteh@nmbtz.com", phone: "+255 22 567 8901", role: "CMO", isPrimary: true },
      { id: "cc2", name: "Akosua Frimpong", email: "a.frimpong@nmbtz.com", phone: "+255 22 678 9012", role: "Marketing Manager", isPrimary: false },
    ],
    status: "active", retainerValue: 8500000, contractStart: "2026-01-01", contractEnd: "2026-12-31",
    accountManager: "u2", totalRevenue: 102000000, tags: ["banking", "retainer", "VIP"],
    createdAt: "2025-06-15",
  },
  {
    id: "c2", company: "Vodacom Tanzania", industry: "Telecom",
    tin: "100-345-678", vrn: "40-034567-X", brn: "2005/012345",
    address: "Vodacom House, Ohio Street", city: "Dar es Salaam", region: "Dar es Salaam", country: "Tanzania",
    contacts: [
      { id: "cc3", name: "Kwabena Asare", email: "k.asare@vodacom.co.tz", phone: "+255 74 100 0001", role: "Brand Manager", isPrimary: true },
    ],
    status: "active", retainerValue: 15000000, contractStart: "2026-01-01", contractEnd: "2026-12-31",
    accountManager: "u2", totalRevenue: 180000000, tags: ["telecom", "enterprise", "VIP"],
    createdAt: "2024-03-01",
  },
  {
    id: "c3", company: "Tanzania Breweries Ltd", industry: "FMCG",
    tin: "100-456-789", vrn: "40-045678-X", brn: "1998/004567",
    address: "TBL Complex, Chang'ombe", city: "Dar es Salaam", region: "Dar es Salaam", country: "Tanzania",
    contacts: [
      { id: "cc4", name: "Comfort Agyemang", email: "c.agyemang@tbl.co.tz", phone: "+255 22 200 0002", role: "Marketing Director", isPrimary: true },
    ],
    status: "active", retainerValue: 12000000, contractStart: "2026-02-01", contractEnd: "2027-01-31",
    accountManager: "u2", totalRevenue: 144000000, tags: ["fmcg", "retainer"],
    createdAt: "2025-02-01",
  },
  {
    id: "c4", company: "Azam Media Limited", industry: "Media & Broadcasting",
    tin: "100-567-890", vrn: "40-056789-X", brn: "2003/007890",
    address: "Azam Centre, Mikocheni", city: "Dar es Salaam", region: "Dar es Salaam", country: "Tanzania",
    contacts: [
      { id: "cc5", name: "Bridget Owusu", email: "b.owusu@azam.co.tz", phone: "+255 22 300 0003", role: "Head of Marketing", isPrimary: true },
    ],
    status: "active", retainerValue: 10000000, contractStart: "2025-10-01", contractEnd: "2026-09-30",
    accountManager: "u2", totalRevenue: 80000000, tags: ["media", "entertainment"],
    createdAt: "2025-10-01",
  },
];

// ── Projects (TZS) ────────────────────────────────────────────────────────────
export const projects: Project[] = [
  {
    id: "p1", name: "NMB Q2 Digital Campaign", clientId: "c1", clientName: "NMB Bank Tanzania",
    type: "digital", status: "active", priority: "high",
    startDate: "2026-04-01", endDate: "2026-06-30",
    budget: 45000000, spent: 28500000, progress: 68,
    teamMembers: ["u2", "u4", "u3"],
    description: "Q2 digital marketing campaign across Facebook, Instagram, and Google Ads",
    tags: ["digital", "q2", "ads"], tasks: [], createdAt: "2026-03-20",
  },
  {
    id: "p2", name: "Vodacom Rebranding Campaign", clientId: "c2", clientName: "Vodacom Tanzania",
    type: "branding", status: "active", priority: "urgent",
    startDate: "2026-05-01", endDate: "2026-08-31",
    budget: 120000000, spent: 35000000, progress: 30,
    teamMembers: ["u2", "u4", "u6"],
    description: "Full rebranding initiative including new brand identity, TV spots, and OOH",
    tags: ["branding", "tv", "ooh"], tasks: [], createdAt: "2026-04-15",
  },
  {
    id: "p3", name: "TBL Influencer Campaign", clientId: "c3", clientName: "Tanzania Breweries Ltd",
    type: "influencer", status: "planning", priority: "medium",
    startDate: "2026-06-01", endDate: "2026-07-31",
    budget: 25000000, spent: 2500000, progress: 10,
    teamMembers: ["u3", "u4"],
    description: "Influencer marketing campaign for new product launch",
    tags: ["influencer", "social", "launch"], tasks: [], createdAt: "2026-05-10",
  },
  {
    id: "p4", name: "Azam Media Social Media", clientId: "c4", clientName: "Azam Media Limited",
    type: "social_media", status: "active", priority: "medium",
    startDate: "2026-01-01", endDate: "2026-12-31",
    budget: 60000000, spent: 25000000, progress: 42,
    teamMembers: ["u2", "u4"],
    description: "Ongoing social media management and content creation",
    tags: ["social-media", "monthly"], tasks: [], createdAt: "2025-12-20",
  },
];

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const tasks: Task[] = [
  {
    id: "t1", title: "Design Facebook Ad Creatives", projectId: "p1",
    assignee: "u4", dueDate: "2026-06-05", priority: "high", status: "in_progress",
    checklist: [
      { id: "ci1", text: "Create concept brief", done: true },
      { id: "ci2", text: "Design 5 ad variations", done: true },
      { id: "ci3", text: "Get internal review", done: false },
      { id: "ci4", text: "Client approval", done: false },
    ],
    attachments: ["nmb_ads_v2.pdf"], comments: 4, tags: ["design", "ads"],
    timeLogged: 8, createdAt: "2026-05-20",
  },
  {
    id: "t2", title: "Write Campaign Copy", projectId: "p1",
    assignee: "u4", dueDate: "2026-06-03", priority: "medium", status: "review",
    checklist: [
      { id: "ci5", text: "Draft headlines", done: true },
      { id: "ci6", text: "Write body copy", done: true },
      { id: "ci7", text: "Proofreading", done: false },
    ],
    attachments: [], comments: 2, tags: ["copywriting"],
    timeLogged: 5, createdAt: "2026-05-18",
  },
  {
    id: "t3", title: "Set up Google Ads Account", projectId: "p1",
    assignee: "u3", dueDate: "2026-05-30", priority: "urgent", status: "done",
    checklist: [
      { id: "ci8", text: "Create account", done: true },
      { id: "ci9", text: "Configure campaigns", done: true },
      { id: "ci10", text: "Set budgets", done: true },
    ],
    attachments: ["google_ads_setup.pdf"], comments: 1, tags: ["ads", "setup"],
    timeLogged: 3, createdAt: "2026-05-15",
  },
  {
    id: "t4", title: "Vodacom Brand Guidelines Document", projectId: "p2",
    assignee: "u4", dueDate: "2026-06-15", priority: "urgent", status: "todo",
    checklist: [
      { id: "ci11", text: "Research current brand assets", done: false },
      { id: "ci12", text: "Design new logo concepts", done: false },
      { id: "ci13", text: "Create style guide", done: false },
    ],
    attachments: [], comments: 0, tags: ["branding", "design"],
    timeLogged: 0, createdAt: "2026-05-25",
  },
  {
    id: "t5", title: "Q2 Performance Report", projectId: "p1",
    assignee: "u2", dueDate: "2026-07-05", priority: "medium", status: "todo",
    checklist: [
      { id: "ci14", text: "Compile analytics data", done: false },
      { id: "ci15", text: "Create report template", done: false },
      { id: "ci16", text: "Present to client", done: false },
    ],
    attachments: [], comments: 0, tags: ["report", "analytics"],
    timeLogged: 0, createdAt: "2026-05-22",
  },
];

// ── Invoices (Tanzania, VAT 18%) ──────────────────────────────────────────────
const VAT = 0.18;

export const invoices: Invoice[] = [
  {
    id: "inv1", number: "INV-2026-0045", type: "invoice",
    clientId: "c1", clientName: "NMB Bank Tanzania",
    clientTIN: "100-234-567", clientVRN: "40-023456-X",
    items: [
      { id: "ii1", description: "Digital Campaign Management – June 2026", quantity: 1, rate: 8500000, amount: 8500000 },
      { id: "ii2", description: "Creative Design (10 assets)", quantity: 10, rate: 250000, amount: 2500000 },
      { id: "ii3", description: "Ad Spend Management Fee", quantity: 1, rate: 1500000, amount: 1500000 },
    ],
    subtotal: 12500000, vatRate: 18, vatAmount: 2250000, total: 14750000,
    status: "sent", issueDate: "2026-05-01", dueDate: "2026-05-31",
    terms: "Payment due within 30 days",
    notes: "All amounts in Tanzania Shillings (TZS)",
    createdBy: "u5",
  },
  {
    id: "inv2", number: "INV-2026-0044", type: "invoice",
    clientId: "c2", clientName: "Vodacom Tanzania",
    clientTIN: "100-345-678", clientVRN: "40-034567-X",
    items: [
      { id: "ii4", description: "Brand Strategy & Consulting", quantity: 1, rate: 15000000, amount: 15000000 },
      { id: "ii5", description: "Logo Design", quantity: 1, rate: 5000000, amount: 5000000 },
    ],
    subtotal: 20000000, vatRate: 18, vatAmount: 3600000, total: 23600000,
    status: "paid", issueDate: "2026-04-01", dueDate: "2026-04-30", paidDate: "2026-04-28",
    paymentMethod: "Bank Transfer",
    terms: "Payment due within 30 days",
    createdBy: "u5",
  },
  {
    id: "inv3", number: "PRO-2026-0012", type: "proforma",
    clientId: "c3", clientName: "Tanzania Breweries Ltd",
    clientTIN: "100-456-789", clientVRN: "40-045678-X",
    items: [
      { id: "ii6", description: "Influencer Campaign Planning & Management", quantity: 1, rate: 5000000, amount: 5000000 },
      { id: "ii7", description: "Content Creation (20 posts)", quantity: 20, rate: 150000, amount: 3000000 },
    ],
    subtotal: 8000000, vatRate: 18, vatAmount: 1440000, total: 9440000,
    status: "sent", issueDate: "2026-05-10", dueDate: "2026-05-25",
    terms: "This is a proforma invoice. Full payment required before work commences.",
    createdBy: "u5",
  },
  {
    id: "inv4", number: "QT-2026-0008", type: "quotation",
    clientId: "c4", clientName: "Azam Media Limited",
    clientTIN: "100-567-890", clientVRN: "40-056789-X",
    items: [
      { id: "ii8", description: "Social Media Management – June 2026", quantity: 1, rate: 5000000, amount: 5000000 },
      { id: "ii9", description: "Content Creation (20 posts)", quantity: 20, rate: 100000, amount: 2000000 },
      { id: "ii10", description: "Monthly Analytics Report", quantity: 1, rate: 500000, amount: 500000 },
    ],
    subtotal: 7500000, vatRate: 18, vatAmount: 1350000, total: 8850000,
    status: "draft", issueDate: "2026-05-28", dueDate: "2026-06-28",
    terms: "Quotation valid for 14 days. Prices exclude WHT.",
    createdBy: "u5",
  },
];

// ── Expenses (TZS) ────────────────────────────────────────────────────────────
export const expenses: Expense[] = [
  { id: "e1", description: "Adobe Creative Suite Subscription", category: "Software", amount: 599000, projectId: "p1", date: "2026-05-01", status: "approved", submittedBy: "u4" },
  { id: "e2", description: "Photography for Vodacom Shoot", category: "Production", amount: 2500000, projectId: "p2", date: "2026-05-15", status: "pending", submittedBy: "u4" },
  { id: "e3", description: "Office Supplies", category: "Admin", amount: 320000, date: "2026-05-10", status: "approved", submittedBy: "u6" },
  { id: "e4", description: "Client Entertainment Dinner", category: "Entertainment", amount: 850000, projectId: "p2", date: "2026-05-18", status: "approved", submittedBy: "u2" },
  { id: "e5", description: "Google Ads Management Fee", category: "Advertising", amount: 1500000, projectId: "p1", date: "2026-05-01", status: "approved", submittedBy: "u3" },
];

// ── Channels ──────────────────────────────────────────────────────────────────
export const channels: Channel[] = [
  { id: "ch1", name: "general", type: "channel", members: ["u_geofrey", "u_admin", "u2", "u3", "u4", "u5", "u6", "u7"], unreadCount: 3, icon: "#" },
  { id: "ch2", name: "campaigns", type: "channel", members: ["u_geofrey", "u_admin", "u2", "u3", "u4"], unreadCount: 0, icon: "#" },
  { id: "ch3", name: "marketing-team", type: "channel", members: ["u_geofrey", "u4", "u6"], unreadCount: 1, icon: "#" },
  { id: "ch4", name: "accounts", type: "channel", members: ["u_geofrey", "u5"], unreadCount: 0, icon: "#" },
  { id: "ch5", name: "Kwame Asante", type: "dm", members: ["u_geofrey", "u2"], unreadCount: 2 },
  { id: "ch6", name: "Ama Boateng", type: "dm", members: ["u_geofrey", "u3"], unreadCount: 0 },
];

// ── Messages ──────────────────────────────────────────────────────────────────
export const messages: Message[] = [
  { id: "m1", senderId: "u2", senderName: "Kwame Asante", content: "Hey team! NMB Bank approved the new campaign concept 🎉", type: "text", timestamp: "2026-05-28T09:15:00", isRead: true },
  { id: "m2", senderId: "u4", senderName: "Kofi Darko", content: "That's great news! I'll start on the final designs today", type: "text", timestamp: "2026-05-28T09:18:00", isRead: true },
  { id: "m3", senderId: "u3", senderName: "Ama Boateng", content: "When's the launch deadline?", type: "text", timestamp: "2026-05-28T09:20:00", isRead: true },
  { id: "m4", senderId: "u2", senderName: "Kwame Asante", content: "June 15th. Plenty of time if we stay focused.", type: "text", timestamp: "2026-05-28T09:22:00", isRead: false },
  { id: "m5", senderId: "u_geofrey", senderName: "Geofrey Maxmillian", content: "Excellent work everyone! Let's have a quick sync at 2pm to align on next steps.", type: "text", timestamp: "2026-05-28T09:30:00", isRead: false },
];

// ── Notifications ─────────────────────────────────────────────────────────────
export const notifications: Notification[] = [
  { id: "n1", type: "approval", title: "Approval Required", message: "Vodacom brand guidelines need your approval", read: false, timestamp: "2026-05-28T09:00:00", link: "/approvals" },
  { id: "n2", type: "lead", title: "New Lead", message: "Vodacom Tanzania submitted a contact form", read: false, timestamp: "2026-05-28T08:30:00", link: "/crm/leads" },
  { id: "n3", type: "payment", title: "Payment Received", message: "Vodacom Tanzania paid invoice INV-2026-0044 – TZS 23,600,000", read: false, timestamp: "2026-05-27T16:45:00" },
  { id: "n4", type: "deadline", title: "Deadline Tomorrow", message: "Task: Design Facebook Ad Creatives due June 5", read: true, timestamp: "2026-05-27T12:00:00" },
  { id: "n5", type: "task", title: "Task Assigned", message: "Kofi assigned you 'Q2 Performance Report'", read: true, timestamp: "2026-05-26T14:30:00" },
  { id: "n6", type: "campaign", title: "Campaign Live", message: "NMB Q2 Digital Campaign is now live", read: true, timestamp: "2026-05-25T10:00:00" },
];

// ── Approvals ─────────────────────────────────────────────────────────────────
export const approvals: ApprovalRequest[] = [
  {
    id: "a1", title: "Vodacom Brand Identity V2", type: "creative", status: "pending",
    requestedBy: "u4", approver: "u_geofrey", projectId: "p2",
    files: ["vodacom_brand_v2.pdf", "logo_concepts.ai"],
    comments: "Second iteration after client feedback. Colors adjusted as requested.",
    createdAt: "2026-05-27T14:00:00",
  },
  {
    id: "a2", title: "NMB Campaign Budget Increase", type: "budget", status: "pending",
    requestedBy: "u2", approver: "u_geofrey", projectId: "p1",
    files: ["budget_revision.xlsx"],
    comments: "Client wants to increase Google Ads spend by TZS 15,000,000",
    createdAt: "2026-05-26T11:00:00",
  },
  {
    id: "a3", title: "TBL Influencer Contracts", type: "proposal", status: "approved",
    requestedBy: "u3", approver: "u_geofrey", projectId: "p3",
    files: ["influencer_contracts.pdf"],
    comments: "Contracts for 5 micro-influencers",
    createdAt: "2026-05-20T10:00:00", reviewedAt: "2026-05-22T09:00:00",
  },
];

// ── Employees ─────────────────────────────────────────────────────────────────
export const employees: Employee[] = [
  {
    id: "u_geofrey", name: "Geofrey Maxmillian", email: "geofrey@integrated.co.tz",
    role: "super_admin", department: "Administration", phone: "+255 712 000 001",
    startDate: "2024-01-01", status: "active",
    kpis: [{ name: "Revenue Growth", target: 20, actual: 12.5, unit: "%" }],
  },
  {
    id: "u_admin", name: "Sarah Mensah", email: "sarah@integrated.co.tz",
    role: "admin", department: "Administration", phone: "+255 712 000 002",
    startDate: "2022-01-15", status: "active",
    kpis: [{ name: "Client Retention", target: 90, actual: 94, unit: "%" }],
  },
  {
    id: "u2", name: "Kwame Asante", email: "kwame@integrated.co.tz",
    role: "manager", department: "Support", phone: "+255 712 000 003",
    startDate: "2022-03-10", status: "active",
    kpis: [{ name: "Client Satisfaction", target: 4.5, actual: 4.7, unit: "/ 5" }],
  },
  {
    id: "u3", name: "Ama Boateng", email: "ama@integrated.co.tz",
    role: "sales_user", department: "Sales", phone: "+255 712 000 004",
    startDate: "2022-06-01", status: "active",
    kpis: [{ name: "Leads Converted", target: 30, actual: 18, unit: "%" }],
  },
  {
    id: "u4", name: "Kofi Darko", email: "kofi@integrated.co.tz",
    role: "marketing_user", department: "Marketing", phone: "+255 712 000 005",
    startDate: "2023-01-20", status: "active",
    kpis: [{ name: "Campaign Delivery", target: 90, actual: 85, unit: "%" }],
  },
  {
    id: "u5", name: "Abena Osei", email: "abena@integrated.co.tz",
    role: "accounts_user", department: "Accounts", phone: "+255 712 000 006",
    startDate: "2022-09-15", status: "active",
    kpis: [{ name: "Invoice Collection", target: 95, actual: 91, unit: "%" }],
  },
  {
    id: "u6", name: "Yaw Amponsah", email: "yaw@integrated.co.tz",
    role: "operations_user", department: "Operations", phone: "+255 712 000 007",
    startDate: "2021-11-05", status: "active",
    kpis: [{ name: "Project On-Time", target: 85, actual: 88, unit: "%" }],
  },
  {
    id: "u7", name: "Grace Mwangi", email: "grace@integrated.co.tz",
    role: "hr_user", department: "HR", phone: "+255 712 000 008",
    startDate: "2023-04-01", status: "active",
    kpis: [{ name: "Staff Retention", target: 90, actual: 93, unit: "%" }],
  },
  {
    id: "u8", name: "Daniel Kimaro", email: "daniel@integrated.co.tz",
    role: "support_user", department: "Support", phone: "+255 712 000 009",
    startDate: "2023-07-15", status: "inactive",
    kpis: [{ name: "Ticket Resolution", target: 95, actual: 80, unit: "%" }],
  },
];
