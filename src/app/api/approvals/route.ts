import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const createSchema = z.object({
  title: z.string().min(1, "Title required"),
  type: z.enum(["creative","campaign","budget","proposal","invoice"]),
  approver_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
  files: z.array(z.string()).default([]),
  comments: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const statusF = searchParams.get("status");

  try {
    const rows = await sql`
      SELECT a.*,
             u.name AS requested_by_name,
             ap.name AS approver_name,
             p.name AS project_name,
             c.company AS client_name
      FROM approvals a
      LEFT JOIN users u ON u.id = a.requested_by
      LEFT JOIN users ap ON ap.id = a.approver_id
      LEFT JOIN projects p ON p.id = a.project_id
      LEFT JOIN clients c ON c.id = a.client_id
      WHERE (${statusF}::text IS NULL OR a.status::text = ${statusF})
      ORDER BY a.created_at DESC
    `;
    return NextResponse.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error("Approvals GET:", err);
    return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = createSchema.parse(await req.json());
    const id = uuid();
    const rows = await sql`
      INSERT INTO approvals (id, title, type, status, requested_by, approver_id, project_id, client_id, files, comments)
      VALUES (${id}, ${data.title}, ${data.type}, 'pending', ${auth.id},
              ${data.approver_id ?? null}, ${data.project_id ?? null},
              ${data.client_id ?? null}, ${data.files}, ${data.comments ?? null})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.issues.map(e => e.message) }, { status: 400 });
    console.error("Approvals POST:", err);
    return NextResponse.json({ error: "Failed to create approval" }, { status: 500 });
  }
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
