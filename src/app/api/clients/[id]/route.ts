import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`SELECT c.*,COALESCE((SELECT json_agg(cc) FROM client_contacts cc WHERE cc.client_id=c.id),'[]') AS contacts FROM clients c WHERE c.id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error:"Not found" }, { status:404 });
  return NextResponse.json(rows[0]);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  if (!["super_admin","admin","manager","account_manager"].includes(auth.role)) return NextResponse.json({ error:"Access denied" }, { status:403 });
  const { id } = await params;
  const b = await req.json();
  if (b.company !== undefined) await sql`UPDATE clients SET company=${b.company},updated_at=NOW() WHERE id=${id}`;
  if (b.industry !== undefined) await sql`UPDATE clients SET industry=${b.industry},updated_at=NOW() WHERE id=${id}`;
  if (b.tin !== undefined) await sql`UPDATE clients SET tin=${b.tin},updated_at=NOW() WHERE id=${id}`;
  if (b.vrn !== undefined) await sql`UPDATE clients SET vrn=${b.vrn},updated_at=NOW() WHERE id=${id}`;
  if (b.brn !== undefined) await sql`UPDATE clients SET brn=${b.brn},updated_at=NOW() WHERE id=${id}`;
  if (b.status !== undefined) await sql`UPDATE clients SET status=${b.status},updated_at=NOW() WHERE id=${id}`;
  if (b.retainer_value !== undefined) await sql`UPDATE clients SET retainer_value=${b.retainer_value},updated_at=NOW() WHERE id=${id}`;
  if (b.tags !== undefined) await sql`UPDATE clients SET tags=${b.tags},updated_at=NOW() WHERE id=${id}`;
  if (b.account_manager_id !== undefined) await sql`UPDATE clients SET account_manager_id=${b.account_manager_id},updated_at=NOW() WHERE id=${id}`;
  const rows = await sql`SELECT c.*,COALESCE((SELECT json_agg(cc) FROM client_contacts cc WHERE cc.client_id=c.id),'[]') AS contacts FROM clients c WHERE c.id=${id} LIMIT 1`;
  return NextResponse.json(rows[0]);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  if (!["super_admin","admin"].includes(auth.role)) return NextResponse.json({ error:"Access denied" }, { status:403 });
  const { id } = await params;
  await sql`DELETE FROM clients WHERE id=${id}`;
  return NextResponse.json({ message:"Deleted" });
}
export async function OPTIONS() { return new NextResponse(null, { status:204 }); }
