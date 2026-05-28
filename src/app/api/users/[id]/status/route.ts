import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, "super_admin", "admin");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const { status } = z.object({ status: z.enum(["active","inactive"]) }).parse(await req.json());
  const check = await sql`SELECT role FROM users WHERE id=${id} LIMIT 1`;
  if (!check[0]) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (check[0].role === "super_admin") return NextResponse.json({ error: "Cannot change Super Admin status" }, { status: 403 });
  const rows = await sql`UPDATE users SET status=${status},updated_at=NOW() WHERE id=${id} RETURNING id,name,status`;
  return NextResponse.json(rows[0]);
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
