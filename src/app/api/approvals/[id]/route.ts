import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const actionSchema = z.object({
  status: z.enum(["approved", "rejected", "revision"]),
  reviewer_notes: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

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
    WHERE a.id = ${id}
    LIMIT 1
  `;
  if (!rows[0]) return NextResponse.json({ error: "Approval not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  try {
    const data = actionSchema.parse(await req.json());

    // Check the approval exists
    const existing = await sql`SELECT * FROM approvals WHERE id = ${id} LIMIT 1`;
    if (!existing[0]) return NextResponse.json({ error: "Approval not found" }, { status: 404 });

    // Only the approver or admin can approve/reject
    const canAct = ["super_admin", "admin", "manager"].includes(auth.role) ||
      (existing[0] as Record<string, unknown>).approver_id === auth.id;
    if (!canAct) {
      return NextResponse.json({ error: "You are not authorized to act on this approval" }, { status: 403 });
    }

    const rows = await sql`
      UPDATE approvals
      SET status = ${data.status}::approval_status_type,
          reviewer_notes = ${data.reviewer_notes ?? null},
          approver_id = ${auth.id},
          reviewed_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    // Fetch with joins for full response
    const full = await sql`
      SELECT a.*,
             u.name AS requested_by_name,
             ap.name AS approver_name
      FROM approvals a
      LEFT JOIN users u ON u.id = a.requested_by
      LEFT JOIN users ap ON ap.id = a.approver_id
      WHERE a.id = ${id}
      LIMIT 1
    `;

    return NextResponse.json(full[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    console.error("Approval PATCH:", err);
    return NextResponse.json({ error: "Failed to update approval" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (!["super_admin", "admin"].includes(auth.role)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const { id } = await params;
  await sql`DELETE FROM approvals WHERE id = ${id}`;
  return NextResponse.json({ message: "Approval deleted" });
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
