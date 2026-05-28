import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "icl-tz-secret-2026";

export interface AuthUser {
  id: string;
  role: string;
  email: string;
  name: string;
}

export function getToken(req: NextRequest): AuthUser | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function requireAuth(req: NextRequest): AuthUser | NextResponse {
  const user = getToken(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  return user;
}

export function requireRole(req: NextRequest, ...roles: string[]): AuthUser | NextResponse {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: `Access denied. Required: ${roles.join(" or ")}` }, { status: 403 });
  }
  return user;
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function apiError(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function cors(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  return response;
}
