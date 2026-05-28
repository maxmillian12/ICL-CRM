import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`SELECT t.*,u.name AS assignee_name,COALESCE((SELECT json_agg(c ORDER BY c.position) FROM task_checklist c WHERE c.task_id=t.id),'[]') AS checklist FROM tasks t LEFT JOIN users u ON u.id=t.assignee_id WHERE t.id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error:"Not found" }, { status:404 });
  return NextResponse.json(rows[0]);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const b = await req.json();
  if (b.title !== undefined) await sql`UPDATE tasks SET title=${b.title},updated_at=NOW() WHERE id=${id}`;
  if (b.status !== undefined) await sql`UPDATE tasks SET status=${b.status}::task_status_type,updated_at=NOW() WHERE id=${id}`;
  if (b.priority !== undefined) await sql`UPDATE tasks SET priority=${b.priority}::priority_type,updated_at=NOW() WHERE id=${id}`;
  if (b.assignee_id !== undefined) await sql`UPDATE tasks SET assignee_id=${b.assignee_id},updated_at=NOW() WHERE id=${id}`;
  if (b.due_date !== undefined) await sql`UPDATE tasks SET due_date=${b.due_date},updated_at=NOW() WHERE id=${id}`;
  if (b.description !== undefined) await sql`UPDATE tasks SET description=${b.description},updated_at=NOW() WHERE id=${id}`;
  if (b.time_logged !== undefined) await sql`UPDATE tasks SET time_logged=${b.time_logged},updated_at=NOW() WHERE id=${id}`;
  if (b.position !== undefined) await sql`UPDATE tasks SET position=${b.position},updated_at=NOW() WHERE id=${id}`;
  const rows = await sql`SELECT * FROM tasks WHERE id=${id} LIMIT 1`;
  return NextResponse.json(rows[0]);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await sql`DELETE FROM tasks WHERE id=${id}`;
  return NextResponse.json({ message:"Deleted" });
}
export async function OPTIONS() { return new NextResponse(null, { status:204 }); }
