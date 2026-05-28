import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  if (!["super_admin","admin","accounts_user","manager"].includes(auth.role)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { id } = await params;
  const { status, payment_method } = z.object({ status: z.enum(["draft","sent","paid","overdue","cancelled"]), payment_method: z.string().optional() }).parse(await req.json());
  const rows = await sql`UPDATE invoices SET status=${status},payment_method=${payment_method||null},paid_date=CASE WHEN ${status}='paid' THEN NOW() ELSE paid_date END,updated_at=NOW() WHERE id=${id} RETURNING *`;
  if (!rows[0]) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
