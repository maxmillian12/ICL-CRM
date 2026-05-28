import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
export async function GET(req: NextRequest) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const [inv,exp] = await Promise.all([
    sql`SELECT COALESCE(SUM(CASE WHEN status='paid' THEN total ELSE 0 END),0)::bigint AS revenue,COALESCE(SUM(CASE WHEN status='sent' THEN total ELSE 0 END),0)::bigint AS pending,COALESCE(SUM(CASE WHEN status='overdue' THEN total ELSE 0 END),0)::bigint AS overdue,COALESCE(SUM(CASE WHEN status='paid' THEN vat_amount ELSE 0 END),0)::bigint AS vat_collected FROM invoices`,
    sql`SELECT COALESCE(SUM(CASE WHEN status='approved' THEN amount ELSE 0 END),0)::bigint AS total FROM expenses`,
  ]);
  const i = (inv[0] ?? {}) as Record<string,unknown>;
  const e = (exp[0] ?? {}) as Record<string,unknown>;
  return NextResponse.json({ totalRevenue:Number(i.revenue??0), pendingRevenue:Number(i.pending??0), overdueRevenue:Number(i.overdue??0), vatCollected:Number(i.vat_collected??0), totalExpenses:Number(e.total??0), profit:Number(i.revenue??0)-Number(e.total??0) });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
