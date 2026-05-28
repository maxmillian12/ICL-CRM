import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const rows = await sql`
    SELECT u.id, u.name, u.email, u.role, u.phone, u.status,
           u.joined_at, u.last_login_at, u.department_id,
           d.name AS department
    FROM users u
    LEFT JOIN departments d ON d.id = u.department_id
    WHERE u.id = ${user.id}
    LIMIT 1
  `;

  if (!rows[0]) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" } });
}
