import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`SELECT p.*,c.company AS client_name,COALESCE((SELECT json_agg(json_build_object('id',u.id,'name',u.name)) FROM project_members pm JOIN users u ON u.id=pm.user_id WHERE pm.project_id=p.id),'[]') AS team_members FROM projects p LEFT JOIN clients c ON c.id=p.client_id WHERE p.id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const body = await req.json();
  const allowed = ["name","type","status","priority","description","start_date","end_date","budget","spent","progress","tags"];
  const keys = Object.keys(body).filter(k => allowed.includes(k));
  if (!keys.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  const { neon } = await import("@neondatabase/serverless");
  const db = neon(process.env.DATABASE_URL!);
  const sets = keys.map((k, i) => `${k}=$${i+2}`).join(",");
  await db.query(`UPDATE projects SET ${sets},updated_at=NOW() WHERE id=$1`, [id, ...keys.map(k => body[k])]);
  const rows = await sql`SELECT p.*,c.company AS client_name FROM projects p LEFT JOIN clients c ON c.id=p.client_id WHERE p.id=${id} LIMIT 1`;
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (!["super_admin","admin"].includes(auth.role)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { id } = await params;
  await sql`DELETE FROM projects WHERE id=${id}`;
  return NextResponse.json({ message: "Project deleted" });
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
