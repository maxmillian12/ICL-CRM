import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
export async function GET(req: NextRequest) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const rows = await sql`SELECT * FROM notifications WHERE user_id=${auth.id} ORDER BY created_at DESC LIMIT 50`;
  return NextResponse.json({ data: rows, unread: rows.filter((n: Record<string,unknown>) => !n.read).length });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
