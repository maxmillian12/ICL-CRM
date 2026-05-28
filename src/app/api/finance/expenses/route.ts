import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
const schema = z.object({ description:z.string().min(1), category:z.string().min(1), amount:z.number().min(1), project_id:z.string().uuid().optional().nullable(), date:z.string(), notes:z.string().optional() });
export async function GET(req: NextRequest) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const rows = await sql`SELECT e.*,u.name AS submitted_by_name,a.name AS approved_by_name,p.name AS project_name FROM expenses e LEFT JOIN users u ON u.id=e.submitted_by LEFT JOIN users a ON a.id=e.approved_by LEFT JOIN projects p ON p.id=e.project_id ORDER BY e.date DESC`;
  return NextResponse.json({ data: rows, total: rows.length });
}
export async function POST(req: NextRequest) {
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  try {
    const data = schema.parse(await req.json());
    const id = uuid();
    const rows = await sql`INSERT INTO expenses (id,description,category,amount,project_id,date,submitted_by,notes) VALUES (${id},${data.description},${data.category},${data.amount},${data.project_id||null},${data.date},${auth.id},${data.notes||null}) RETURNING *`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error:"Validation failed", details:err.issues.map(e=>e.message) }, { status:400 });
    return NextResponse.json({ error:"Failed to create expense" }, { status:500 });
  }
}
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
