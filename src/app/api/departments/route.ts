import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/api-auth";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  head_id: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const rows = await sql`
    SELECT d.*, COUNT(u.id)::int AS member_count,
           h.name AS head_name
    FROM departments d
    LEFT JOIN users u ON u.department_id = d.id
    LEFT JOIN users h ON h.id = d.head_id
    GROUP BY d.id, h.name ORDER BY d.name
  `;
  return NextResponse.json({ data: rows, total: rows.length });
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, "super_admin", "admin");
  if (auth instanceof NextResponse) return auth;
  try {
    const data = schema.parse(await req.json());
    const id = data.name.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z_]/g,"");
    const rows = await sql`
      INSERT INTO departments (id, name, description, head_id)
      VALUES (${id}, ${data.name}, ${data.description??null}, ${data.head_id??null})
      ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.issues.map(e=>e.message) }, { status: 400 });
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
