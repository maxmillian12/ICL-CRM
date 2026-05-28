import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { sql } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/api-auth";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.string().min(1),
  department_id: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  if (!["super_admin","admin","manager"].includes(user.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const rows = await sql`
    SELECT u.id, u.name, u.email, u.role, u.phone, u.status,
           u.joined_at, u.last_login_at, u.department_id,
           d.name AS department
    FROM users u
    LEFT JOIN departments d ON d.id = u.department_id
    ORDER BY u.name
  `;
  return NextResponse.json({ data: rows, total: rows.length });
}

export async function POST(req: NextRequest) {
  const user = requireRole(req, "super_admin", "admin");
  if (user instanceof NextResponse) return user;
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const existing = await sql`SELECT id FROM users WHERE email=${data.email} LIMIT 1`;
    if (existing.length > 0) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    const hash = await bcrypt.hash(data.password, 10);
    const id = uuid();
    const rows = await sql`
      INSERT INTO users (id, name, email, password_hash, role, department_id, phone, status)
      VALUES (${id}, ${data.name}, ${data.email}, ${hash}, ${data.role},
              ${data.department_id ?? null}, ${data.phone ?? null}, 'active')
      RETURNING id, name, email, role, phone, status, joined_at
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.issues.map(e=>`${e.path}: ${e.message}`) }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" } });
}
