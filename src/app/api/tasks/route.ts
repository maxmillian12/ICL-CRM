import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const schema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  project_id: z.string().uuid().optional().nullable(),
  assignee_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable(),
  priority: z.enum(["low","medium","high","urgent"]).default("medium"),
  status: z.enum(["todo","in_progress","review","done"]).default("todo"),
  tags: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(req.url);
  const projectF = searchParams.get("project_id");
  const assigneeF = searchParams.get("assignee_id");
  const statusF = searchParams.get("status");
  try {
    const rows = await sql`
      SELECT t.*, u.name AS assignee_name, p.name AS project_name,
             COALESCE((SELECT json_agg(c ORDER BY c.position) FROM task_checklist c WHERE c.task_id=t.id),'[]') AS checklist,
             (SELECT COUNT(*)::int FROM task_comments tc WHERE tc.task_id=t.id) AS comments
      FROM tasks t LEFT JOIN users u ON u.id=t.assignee_id LEFT JOIN projects p ON p.id=t.project_id
      WHERE (${projectF}::uuid IS NULL OR t.project_id = ${projectF}::uuid)
        AND (${assigneeF}::uuid IS NULL OR t.assignee_id = ${assigneeF}::uuid)
        AND (${statusF}::text IS NULL OR t.status::text = ${statusF})
      ORDER BY t.due_date ASC NULLS LAST
    `;
    return NextResponse.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error("Tasks error:", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const data = schema.parse(await req.json());
    const id = uuid();
    const rows = await sql`
      INSERT INTO tasks (id,title,description,project_id,assignee_id,due_date,priority,status,tags,created_by)
      VALUES (${id},${data.title},${data.description||null},${data.project_id||null},${data.assignee_id||null},
              ${data.due_date||null},${data.priority},${data.status},${data.tags},${auth.id})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.issues.map(e=>`${e.path}: ${e.message}`) }, { status: 400 });
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
