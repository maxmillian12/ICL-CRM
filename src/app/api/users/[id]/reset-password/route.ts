import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, "super_admin", "admin");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const { password } = z.object({ password: z.string().min(6,"Min 6 characters") }).parse(await req.json());
  const hash = await bcrypt.hash(password, 10);
  await sql`UPDATE users SET password_hash=${hash},updated_at=NOW() WHERE id=${id}`;
  return NextResponse.json({ message: "Password reset successfully" });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
