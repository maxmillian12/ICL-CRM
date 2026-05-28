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
  const auth = requireAuth(req); if (auth instanceof NextResponse) return auth;
  const rows = await sql`SELECT * FROM app_settings LIMIT 1`;
  return NextResponse.json(rows[0] ?? {});
}
export async function PUT(req: NextRequest) {
  const auth = requireRole(req,"super_admin"); if (auth instanceof NextResponse) return auth;
  try {
    const data = schema.parse(await req.json());
    // Update each field individually
    if (data.company_name !== undefined) await sql`UPDATE app_settings SET company_name=${data.company_name},updated_at=NOW()`;
    if (data.company_tin !== undefined) await sql`UPDATE app_settings SET company_tin=${data.company_tin},updated_at=NOW()`;
    if (data.company_vrn !== undefined) await sql`UPDATE app_settings SET company_vrn=${data.company_vrn},updated_at=NOW()`;
    if (data.company_brn !== undefined) await sql`UPDATE app_settings SET company_brn=${data.company_brn},updated_at=NOW()`;
    if (data.company_address !== undefined) await sql`UPDATE app_settings SET company_address=${data.company_address},updated_at=NOW()`;
    if (data.company_phone !== undefined) await sql`UPDATE app_settings SET company_phone=${data.company_phone},updated_at=NOW()`;
    if (data.company_email !== undefined) await sql`UPDATE app_settings SET company_email=${data.company_email},updated_at=NOW()`;
    if (data.vat_enabled !== undefined) await sql`UPDATE app_settings SET vat_enabled=${data.vat_enabled},updated_at=NOW()`;
    if (data.vat_rate !== undefined) await sql`UPDATE app_settings SET vat_rate=${data.vat_rate},updated_at=NOW()`;
    if (data.withholding_tax_rate !== undefined) await sql`UPDATE app_settings SET withholding_tax_rate=${data.withholding_tax_rate},updated_at=NOW()`;
    if (data.invoice_prefix !== undefined) await sql`UPDATE app_settings SET invoice_prefix=${data.invoice_prefix},updated_at=NOW()`;
    if (data.quotation_prefix !== undefined) await sql`UPDATE app_settings SET quotation_prefix=${data.quotation_prefix},updated_at=NOW()`;
    if (data.proforma_prefix !== undefined) await sql`UPDATE app_settings SET proforma_prefix=${data.proforma_prefix},updated_at=NOW()`;
    const rows = await sql`SELECT * FROM app_settings LIMIT 1`;
    return NextResponse.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error:"Validation failed", details:err.issues.map(e=>e.message) }, { status:400 });
    console.error("Settings error:", err);
    return NextResponse.json({ error:"Failed to save settings" }, { status:500 });
  }
}
export async function OPTIONS() { return new NextResponse(null, { status:204 }); }
