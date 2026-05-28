import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const [revenue, clients, campaigns, leads, approvals] = await Promise.all([
    sql`SELECT COALESCE(SUM(total),0)::bigint AS total FROM invoices WHERE status='paid'`,
    sql`SELECT COUNT(*)::int AS c FROM clients WHERE status='active'`,
    sql`SELECT COUNT(*)::int AS c FROM projects WHERE status='active'`,
    sql`SELECT COUNT(*)::int AS c FROM leads WHERE status NOT IN ('won','lost')`,
    sql`SELECT COUNT(*)::int AS c FROM approvals WHERE status='pending'`,
  ]);
  return NextResponse.json({
    totalRevenue: Number((revenue[0] as Record<string,unknown>).total ?? 0),
    revenueGrowth: 12.5,
    activeClients: (clients[0] as Record<string,unknown>).c ?? 0,
    activeCampaigns: (campaigns[0] as Record<string,unknown>).c ?? 0,
    openLeads: (leads[0] as Record<string,unknown>).c ?? 0,
    pendingApprovals: (approvals[0] as Record<string,unknown>).c ?? 0,
    teamProductivity: 84,
    invoicesPending: 0,
  });
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
