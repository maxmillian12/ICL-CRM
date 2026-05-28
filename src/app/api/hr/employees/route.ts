import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
export async function GET(req: NextRequest) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const rows = await sql`SELECT u.id,u.name,u.email,u.role,u.phone,u.status,u.joined_at,u.department_id,d.name AS department FROM users u LEFT JOIN departments d ON d.id=u.department_id ORDER BY u.name`;
  return NextResponse.json({ data: rows, total: rows.length });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
