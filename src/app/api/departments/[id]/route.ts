import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/api-auth";

const LOCKED = ["administration","sales","accounts","hr","support","marketing","operations"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`SELECT * FROM departments WHERE id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error: "Department not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, "super_admin", "admin");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const data = z.object({ name: z.string().optional(), description: z.string().optional().nullable(), head_id: z.string().optional().nullable() }).parse(await req.json());
  const sets: string[] = ["updated_at=NOW()"];
  const vals: unknown[] = [id];
  let i = 2;
  if (data.name) { sets.push(`name=$${i++}`); vals.push(data.name); }
  if (data.description !== undefined) { sets.push(`description=$${i++}`); vals.push(data.description); }
  if (data.head_id !== undefined) { sets.push(`head_id=$${i++}`); vals.push(data.head_id); }
  const { neon } = await import("@neondatabase/serverless");
  const db = neon(process.env.DATABASE_URL!);
  const res = await db.query(`UPDATE departments SET ${sets.join(",")} WHERE id=$1 RETURNING *`, vals);
  if (!(res as unknown as {rows: Record<string,unknown>[]}).rows[0]) return NextResponse.json({ error: "Department not found" }, { status: 404 });
  return NextResponse.json((res as unknown as {rows: Record<string,unknown>[]}).rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, "super_admin");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (LOCKED.includes(id)) return NextResponse.json({ error: "Cannot delete a default department" }, { status: 400 });
  await sql`DELETE FROM departments WHERE id=${id}`;
  return NextResponse.json({ message: "Department deleted" });
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
