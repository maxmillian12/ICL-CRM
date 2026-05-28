import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`SELECT * FROM leads WHERE id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error:"Not found" }, { status:404 });
  return NextResponse.json(rows[0]);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const b = await req.json();
  if (b.company !== undefined) await sql`UPDATE leads SET company=${b.company},updated_at=NOW() WHERE id=${id}`;
  if (b.contact_name !== undefined) await sql`UPDATE leads SET contact_name=${b.contact_name},updated_at=NOW() WHERE id=${id}`;
  if (b.status !== undefined) await sql`UPDATE leads SET status=${b.status}::lead_status_type,updated_at=NOW() WHERE id=${id}`;
  if (b.score !== undefined) await sql`UPDATE leads SET score=${b.score},updated_at=NOW() WHERE id=${id}`;
  if (b.budget !== undefined) await sql`UPDATE leads SET budget=${b.budget},updated_at=NOW() WHERE id=${id}`;
  if (b.notes !== undefined) await sql`UPDATE leads SET notes=${b.notes},updated_at=NOW() WHERE id=${id}`;
  if (b.assigned_to !== undefined) await sql`UPDATE leads SET assigned_to=${b.assigned_to},updated_at=NOW() WHERE id=${id}`;
  const rows = await sql`SELECT * FROM leads WHERE id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error:"Not found" }, { status:404 });
  return NextResponse.json(rows[0]);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  if (!["super_admin","admin","manager"].includes(auth.role)) return NextResponse.json({ error:"Access denied" }, { status:403 });
  const { id } = await params;
  await sql`DELETE FROM leads WHERE id=${id}`;
  return NextResponse.json({ message:"Deleted" });
}
export async function OPTIONS() { return new NextResponse(null, { status:204 }); }
