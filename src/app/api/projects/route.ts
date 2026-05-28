import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const schema = z.object({
  name: z.string().min(1, "Project name required"),
  client_id: z.string().uuid().optional().nullable(),
  type: z.enum(["social_media","tv","radio","influencer","branding","digital","outdoor","event"]),
  status: z.enum(["planning","active","on_hold","completed","cancelled"]).default("planning"),
  priority: z.enum(["low","medium","high","urgent"]).default("medium"),
  description: z.string().optional(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  budget: z.number().min(0).default(0),
  tags: z.array(z.string()).default([]),
  team_member_ids: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const clientId = searchParams.get("client_id");

  const conditions: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (status) { conditions.push(`p.status=$${i++}`); vals.push(status); }
  if (clientId) { conditions.push(`p.client_id=$${i++}`); vals.push(clientId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { neon } = await import("@neondatabase/serverless");
  const db = neon(process.env.DATABASE_URL!);
  const res = await db.query(`
    SELECT p.*, c.company AS client_name,
           COALESCE((SELECT json_agg(u.name) FROM project_members pm JOIN users u ON u.id=pm.user_id WHERE pm.project_id=p.id),'[]') AS team_members
    FROM projects p LEFT JOIN clients c ON c.id=p.client_id
    ${where} ORDER BY p.created_at DESC
  `, vals);
  return NextResponse.json({ data: (res as unknown as {rows: Record<string,unknown>[]}).rows, total: (res as unknown as {rows: Record<string,unknown>[]}).rows.length });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (["client","freelancer","support_user","hr_user"].includes(auth.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  try {
    const data = schema.parse(await req.json());
    const id = uuid();
    await sql`
      INSERT INTO projects (id,name,client_id,type,status,priority,description,start_date,end_date,budget,tags,created_by)
      VALUES (${id},${data.name},${data.client_id??null},${data.type},${data.status},${data.priority},
              ${data.description??null},${data.start_date??null},${data.end_date??null},${data.budget},${data.tags},${auth.id})
    `;
    if (data.team_member_ids.length > 0) {
      for (const uid of data.team_member_ids) {
        await sql`INSERT INTO project_members (project_id,user_id) VALUES (${id},${uid}) ON CONFLICT DO NOTHING`;
      }
    }
    const rows = await sql`
      SELECT p.*, c.company AS client_name,
             COALESCE((SELECT json_agg(u.name) FROM project_members pm JOIN users u ON u.id=pm.user_id WHERE pm.project_id=p.id),'[]') AS team_members
      FROM projects p LEFT JOIN clients c ON c.id=p.client_id WHERE p.id=${id} LIMIT 1
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.issues.map(e=>`${e.path}: ${e.message}`) }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
