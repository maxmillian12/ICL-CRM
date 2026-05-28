import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const schema = z.object({
  company: z.string().min(1, "Company name required"),
  industry: z.string().optional(),
  tin: z.string().optional().nullable(),
  vrn: z.string().optional().nullable(),
  brn: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  country: z.string().default("Tanzania"),
  status: z.enum(["active","inactive","prospect"]).default("active"),
  retainer_value: z.number().optional().nullable(),
  contract_start: z.string().optional().nullable(),
  contract_end: z.string().optional().nullable(),
  account_manager_id: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const rows = await sql`
    SELECT c.*, u.name AS account_manager_name,
           COALESCE(
             (SELECT json_agg(cc) FROM client_contacts cc WHERE cc.client_id=c.id), '[]'
           ) AS contacts
    FROM clients c LEFT JOIN users u ON u.id=c.account_manager_id
    ORDER BY c.company
  `;
  return NextResponse.json({ data: rows, total: rows.length });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (!["super_admin","admin","manager","account_manager"].includes(auth.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  try {
    const data = schema.parse(await req.json());
    const id = uuid();
    await sql`
      INSERT INTO clients (id,company,industry,tin,vrn,brn,address,city,region,country,
                           status,retainer_value,contract_start,contract_end,account_manager_id,total_revenue,tags)
      VALUES (${id},${data.company},${data.industry||null},${data.tin||null},${data.vrn||null},
              ${data.brn||null},${data.address||null},${data.city||null},${data.region||null},
              ${data.country},${data.status},${data.retainer_value||null},
              ${data.contract_start||null},${data.contract_end||null},
              ${data.account_manager_id||null},0,${data.tags})
    `;
    const rows = await sql`
      SELECT c.*, COALESCE((SELECT json_agg(cc) FROM client_contacts cc WHERE cc.client_id=c.id),'[]') AS contacts
      FROM clients c WHERE c.id=${id} LIMIT 1
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.issues.map(e=>`${e.path}: ${e.message}`) }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
