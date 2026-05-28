import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/api-auth";

const schema = z.object({
  company_name: z.string().optional(),
  company_tin: z.string().optional(),
  company_vrn: z.string().optional(),
  company_brn: z.string().optional(),
  company_address: z.string().optional(),
  company_phone: z.string().optional(),
  company_email: z.string().email().optional(),
  vat_enabled: z.boolean().optional(),
  vat_rate: z.number().min(0).max(100).optional(),
  withholding_tax_rate: z.number().min(0).max(100).optional(),
  invoice_prefix: z.string().max(10).optional(),
  quotation_prefix: z.string().max(10).optional(),
  proforma_prefix: z.string().max(10).optional(),
});

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const rows = await sql`SELECT * FROM app_settings LIMIT 1`;
  return NextResponse.json(rows[0] ?? {});
}

export async function PUT(req: NextRequest) {
  const auth = requireRole(req, "super_admin");
  if (auth instanceof NextResponse) return auth;
  try {
    const data = schema.parse(await req.json());
    const existing = await sql`SELECT id FROM app_settings LIMIT 1`;
    const keys = Object.keys(data) as (keyof typeof data)[];
    if (!keys.length) return NextResponse.json({ error: "No fields provided" }, { status: 400 });

    const { neon } = await import("@neondatabase/serverless");
    const db = neon(process.env.DATABASE_URL!);

    if (existing.length > 0) {
      const id = (existing[0] as Record<string, unknown>).id;
      const sets = keys.map((k, i) => `${k}=$${i + 2}`).join(",");
      const vals = [id, ...keys.map(k => data[k])];
      const res = await db.query(`UPDATE app_settings SET ${sets},updated_at=NOW() WHERE id=$1 RETURNING *`, vals);
      return NextResponse.json((res as unknown as {rows: Record<string,unknown>[]}).rows[0]);
    } else {
      const cols = keys.join(",");
      const phs = keys.map((_, i) => `$${i + 1}`).join(",");
      const res = await db.query(`INSERT INTO app_settings (${cols}) VALUES (${phs}) RETURNING *`, keys.map(k => data[k]));
      return NextResponse.json((res as unknown as {rows: Record<string,unknown>[]}).rows[0]);
    }
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.issues.map(e => e.message) }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
