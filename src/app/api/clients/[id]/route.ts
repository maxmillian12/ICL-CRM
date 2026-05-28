import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`
    SELECT c.*, COALESCE((SELECT json_agg(cc) FROM client_contacts cc WHERE cc.client_id=c.id),'[]') AS contacts
    FROM clients c WHERE c.id=${id} LIMIT 1
  `;
  if (!rows[0]) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (!["super_admin","admin","manager","account_manager"].includes(auth.role)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const allowed = ["company","industry","tin","vrn","brn","address","city","region","country","status","retainer_value","contract_start","contract_end","account_manager_id","tags","notes"];
  const keys = Object.keys(body).filter(k => allowed.includes(k));
  if (!keys.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  const { neon } = await import("@neondatabase/serverless");
  const db = neon(process.env.DATABASE_URL!);
  const sets = keys.map((k, i) => `${k}=$${i+2}`).join(",");
  await db.query(`UPDATE clients SET ${sets},updated_at=NOW() WHERE id=$1`, [id, ...keys.map(k => body[k])]);
  const rows = await sql`SELECT c.*,COALESCE((SELECT json_agg(cc) FROM client_contacts cc WHERE cc.client_id=c.id),'[]') AS contacts FROM clients c WHERE c.id=${id} LIMIT 1`;
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (!["super_admin","admin"].includes(auth.role)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { id } = await params;
  await sql`DELETE FROM clients WHERE id=${id}`;
  return NextResponse.json({ message: "Client deleted" });
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
