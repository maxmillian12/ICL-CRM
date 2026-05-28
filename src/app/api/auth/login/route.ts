import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sql } from "@/lib/db";
import { signToken } from "@/lib/api-auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const users = await sql`
      SELECT u.*, d.name AS department
      FROM users u
      LEFT JOIN departments d ON d.id = u.department_id
      WHERE u.email = ${email}
      LIMIT 1
    `;

    const user = users[0] as Record<string, unknown> | undefined;
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (user.status !== "active") {
      return NextResponse.json({ error: "Account is disabled. Contact your administrator." }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password_hash as string);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Update last login
    await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}`;

    const payload = {
      id: user.id as string,
      role: user.role as string,
      email: user.email as string,
      name: user.name as string,
    };
    const token = signToken(payload);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        department_id: user.department_id,
        phone: user.phone,
        status: user.status,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues.map((e: {message: string}) => e.message) }, { status: 400 });
    }
    console.error("Login error:", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
