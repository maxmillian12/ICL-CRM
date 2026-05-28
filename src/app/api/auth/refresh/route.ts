import { NextRequest, NextResponse } from "next/server";
import { requireAuth, signToken } from "@/lib/api-auth";
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  return NextResponse.json({ token: signToken(user) });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
