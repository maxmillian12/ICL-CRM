import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  await sql`UPDATE notifications SET read=true WHERE id=${id} AND user_id=${auth.id}`;
  return NextResponse.json({ message: "Marked as read" });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
