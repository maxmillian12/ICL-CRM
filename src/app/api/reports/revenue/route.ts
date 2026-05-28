import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const rows = await sql`
    SELECT TO_CHAR(issue_date,'Mon') AS month,
           EXTRACT(MONTH FROM issue_date)::int AS month_num,
           COALESCE(SUM(CASE WHEN status='paid' THEN subtotal ELSE 0 END),0)::bigint AS revenue,
           0::bigint AS expenses, 0::bigint AS profit
    FROM invoices
    WHERE issue_date >= NOW() - INTERVAL '12 months'
    GROUP BY month, month_num ORDER BY month_num
  `;
  return NextResponse.json(rows);
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
