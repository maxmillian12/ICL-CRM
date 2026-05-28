import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const schema = z.object({
  company: z.string().min(1, "Company name required"),
  contact_name: z.string().min(1, "Contact name required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  industry: z.string().optional(),
  source: z.enum(["website","facebook","google_ads","whatsapp","referral","email","linkedin","other"]).default("other"),
  budget: z.number().min(0).default(0),
  status: z.enum(["new","contacted","proposal_sent","negotiation","won","lost"]).default("new"),
  score: z.number().min(0).max(100).default(50),
  assigned_to: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const assignedTo = auth.role === "sales_user" ? auth.id : searchParams.get("assigned_to");

  const conditions: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (status) { conditions.push(`l.status=$${i++}`); vals.push(status); }
  if (assignedTo) { conditions.push(`l.assigned_to=$${i++}`); vals.push(assignedTo); }
  if (search) { conditions.push(`(l.company ILIKE $${i} OR l.contact_name ILIKE $${i})`); vals.push(`%${search}%`); i++; }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { neon } = await import("@neondatabase/serverless");
  const db = neon(process.env.DATABASE_URL!);
  const res = await db.query(`
    SELECT l.*, u.name AS assigned_to_name
    FROM leads l LEFT JOIN users u ON u.id=l.assigned_to
    ${where} ORDER BY l.created_at DESC
  `, vals);
  return NextResponse.json({ data: (res as unknown as {rows: Record<string,unknown>[]}).rows, total: (res as unknown as {rows: Record<string,unknown>[]}).rows.length });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const data = schema.parse(await req.json());
    const id = uuid();
    const rows = await sql`
      INSERT INTO leads (id,company,contact_name,email,phone,industry,source,budget,status,score,assigned_to,notes,tags,created_by)
      VALUES (${id},${data.company},${data.contact_name},${data.email||null},${data.phone||null},
              ${data.industry||null},${data.source},${data.budget},${data.status},${data.score},
              ${data.assigned_to||null},${data.notes||null},${data.tags},${auth.id})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.issues.map(e=>`${e.path}: ${e.message}`) }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
