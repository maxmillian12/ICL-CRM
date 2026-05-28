import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req,"super_admin","admin","manager","accounts_user"); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const rows = await sql`UPDATE expenses SET status='rejected',approved_by=${auth.id} WHERE id=${id} RETURNING *`;
  if (!rows[0]) return NextResponse.json({ error:"Not found" }, { status:404 });
  return NextResponse.json(rows[0]);
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
