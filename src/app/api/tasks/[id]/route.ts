import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`SELECT t.*,u.name AS assignee_name,COALESCE((SELECT json_agg(c ORDER BY c.position) FROM task_checklist c WHERE c.task_id=t.id),'[]') AS checklist FROM tasks t LEFT JOIN users u ON u.id=t.assignee_id WHERE t.id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const body = await req.json();
  const allowed = ["title","description","assignee_id","due_date","priority","status","tags","time_logged","position"];
  const keys = Object.keys(body).filter(k => allowed.includes(k));
  if (!keys.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  const { neon } = await import("@neondatabase/serverless");
  const db = neon(process.env.DATABASE_URL!);
  const sets = keys.map((k,i) => `${k}=$${i+2}`).join(",");
  const res = await db.query(`UPDATE tasks SET ${sets},updated_at=NOW() WHERE id=$1 RETURNING *`, [id, ...keys.map(k => body[k])]);
  return NextResponse.json((res as unknown as {rows: Record<string,unknown>[]}).rows[0] ?? { error: "Not found" });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await sql`DELETE FROM tasks WHERE id=${id}`;
  return NextResponse.json({ message: "Task deleted" });
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
