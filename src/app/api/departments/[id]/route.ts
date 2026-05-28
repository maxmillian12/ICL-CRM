import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/api-auth";
const LOCKED = ["administration","sales","accounts","hr","support","marketing","operations"];
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`SELECT * FROM departments WHERE id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error:"Not found" }, { status:404 });
  return NextResponse.json(rows[0]);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req,"super_admin","admin"); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const data = z.object({ name:z.string().optional(), description:z.string().optional().nullable(), head_id:z.string().optional().nullable() }).parse(await req.json());
  if (data.name !== undefined) await sql`UPDATE departments SET name=${data.name},updated_at=NOW() WHERE id=${id}`;
  if (data.description !== undefined) await sql`UPDATE departments SET description=${data.description},updated_at=NOW() WHERE id=${id}`;
  if (data.head_id !== undefined) await sql`UPDATE departments SET head_id=${data.head_id},updated_at=NOW() WHERE id=${id}`;
  const rows = await sql`SELECT * FROM departments WHERE id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error:"Not found" }, { status:404 });
  return NextResponse.json(rows[0]);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req,"super_admin"); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (LOCKED.includes(id)) return NextResponse.json({ error:"Cannot delete a default department" }, { status:400 });
  await sql`DELETE FROM departments WHERE id=${id}`;
  return NextResponse.json({ message:"Deleted" });
}
export async function OPTIONS() { return new NextResponse(null, { status:204 }); }
