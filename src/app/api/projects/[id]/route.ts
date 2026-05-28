import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`SELECT p.*,c.company AS client_name,COALESCE((SELECT json_agg(json_build_object('id',u.id,'name',u.name)) FROM project_members pm JOIN users u ON u.id=pm.user_id WHERE pm.project_id=p.id),'[]') AS team_members FROM projects p LEFT JOIN clients c ON c.id=p.client_id WHERE p.id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error:"Not found" }, { status:404 });
  return NextResponse.json(rows[0]);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const b = await req.json();
  if (b.name !== undefined) await sql`UPDATE projects SET name=${b.name},updated_at=NOW() WHERE id=${id}`;
  if (b.status !== undefined) await sql`UPDATE projects SET status=${b.status}::project_status_type,updated_at=NOW() WHERE id=${id}`;
  if (b.priority !== undefined) await sql`UPDATE projects SET priority=${b.priority}::priority_type,updated_at=NOW() WHERE id=${id}`;
  if (b.progress !== undefined) await sql`UPDATE projects SET progress=${b.progress},updated_at=NOW() WHERE id=${id}`;
  if (b.spent !== undefined) await sql`UPDATE projects SET spent=${b.spent},updated_at=NOW() WHERE id=${id}`;
  if (b.description !== undefined) await sql`UPDATE projects SET description=${b.description},updated_at=NOW() WHERE id=${id}`;
  if (b.tags !== undefined) await sql`UPDATE projects SET tags=${b.tags},updated_at=NOW() WHERE id=${id}`;
  const rows = await sql`SELECT p.*,c.company AS client_name FROM projects p LEFT JOIN clients c ON c.id=p.client_id WHERE p.id=${id} LIMIT 1`;
  return NextResponse.json(rows[0]);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  if (!["super_admin","admin"].includes(auth.role)) return NextResponse.json({ error:"Access denied" }, { status:403 });
  const { id } = await params;
  await sql`DELETE FROM projects WHERE id=${id}`;
  return NextResponse.json({ message:"Deleted" });
}
export async function OPTIONS() { return new NextResponse(null, { status:204 }); }
