import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.string().optional(),
  department_id: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(["active","inactive"]).optional(),
}).strict();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (auth.id !== id && !["super_admin","admin","manager"].includes(auth.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const rows = await sql`SELECT u.id,u.name,u.email,u.role,u.phone,u.status,u.joined_at,u.department_id,d.name AS department FROM users u LEFT JOIN departments d ON d.id=u.department_id WHERE u.id=${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const isSelf = auth.id === id;
  const isAdmin = ["super_admin","admin"].includes(auth.role);
  if (!isSelf && !isAdmin) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  try {
    const body = await req.json();
    if (!isAdmin && body.role) return NextResponse.json({ error: "Cannot change your own role" }, { status: 403 });
    const data = updateSchema.parse(body);
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 2;
    if (data.name) { sets.push(`name=$${i++}`); vals.push(data.name); }
    if (data.email) { sets.push(`email=$${i++}`); vals.push(data.email); }
    if (data.role) { sets.push(`role=$${i++}`); vals.push(data.role); }
    if (data.phone !== undefined) { sets.push(`phone=$${i++}`); vals.push(data.phone); }
    if (data.department_id !== undefined) { sets.push(`department_id=$${i++}`); vals.push(data.department_id); }
    if (data.status) { sets.push(`status=$${i++}`); vals.push(data.status); }
    if (data.password) { sets.push(`password_hash=$${i++}`); vals.push(await bcrypt.hash(data.password, 10)); }
    if (!sets.length) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    sets.push("updated_at=NOW()");
    const query = `UPDATE users SET ${sets.join(",")} WHERE id=$1 RETURNING id,name,email,role,status`;
    const { neon } = await import("@neondatabase/serverless");
    const db = neon(process.env.DATABASE_URL!);
    const rows = await db.query(query, [id, ...vals]);
    if (!(rows as unknown as {rows: Record<string,unknown>[]}).rows[0]) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json((rows as unknown as {rows: Record<string,unknown>[]}).rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.issues.map(e => e.message) }, { status: 400 });
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (auth.role !== "super_admin") return NextResponse.json({ error: "Super Admin only" }, { status: 403 });
  const { id } = await params;
  if (auth.id === id) return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  const check = await sql`SELECT role FROM users WHERE id=${id} LIMIT 1`;
  if (check[0]?.role === "super_admin") return NextResponse.json({ error: "Cannot delete Super Admin" }, { status: 403 });
  await sql`DELETE FROM users WHERE id=${id}`;
  return NextResponse.json({ message: "User deleted" });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
