import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`SELECT * FROM leads WHERE id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const body = await req.json();
  const allowed = ["company","contact_name","email","phone","industry","source","budget","status","score","assigned_to","notes","tags"];
  const keys = Object.keys(body).filter(k => allowed.includes(k));
  if (!keys.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  const { neon } = await import("@neondatabase/serverless");
  const db = neon(process.env.DATABASE_URL!);
  const sets = keys.map((k, i) => `${k}=$${i + 2}`).join(",");
  const res = await db.query(`UPDATE leads SET ${sets},updated_at=NOW() WHERE id=$1 RETURNING *`, [id, ...keys.map(k => body[k])]);
  if (!(res as unknown as {rows: Record<string,unknown>[]}).rows[0]) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json((res as unknown as {rows: Record<string,unknown>[]}).rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (!["super_admin","admin","manager"].includes(auth.role)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { id } = await params;
  await sql`DELETE FROM leads WHERE id=${id}`;
  return NextResponse.json({ message: "Lead deleted" });
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
