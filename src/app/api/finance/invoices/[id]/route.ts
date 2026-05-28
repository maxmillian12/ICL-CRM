import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`SELECT inv.*,c.company AS client_name,c.tin AS client_tin,c.vrn AS client_vrn,COALESCE((SELECT json_agg(ii) FROM invoice_items ii WHERE ii.invoice_id=inv.id),'[]') AS items FROM invoices inv LEFT JOIN clients c ON c.id=inv.client_id WHERE inv.id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  if (!["super_admin","admin"].includes(auth.role)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { id } = await params;
  await sql`DELETE FROM invoices WHERE id=${id}`;
  return NextResponse.json({ message: "Invoice deleted" });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
