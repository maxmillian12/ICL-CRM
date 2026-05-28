import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
export async function POST(req: NextRequest) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  await sql`UPDATE notifications SET read=true WHERE user_id=${auth.id}`;
  return NextResponse.json({ message: "All marked as read" });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
