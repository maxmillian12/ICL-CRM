import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(0.01),
  rate: z.number().min(0),
});

const schema = z.object({
  type: z.enum(["invoice","proforma","quotation"]).default("invoice"),
  client_id: z.string().uuid("Valid client required"),
  items: z.array(itemSchema).min(1, "At least one line item required"),
  issue_date: z.string(),
  due_date: z.string(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

const WRITE_ROLES = ["super_admin","admin","manager","accounts_user"];

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (!WRITE_ROLES.includes(auth.role)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const conditions: string[] = [];
  const vals: unknown[] = [];
  let i = 1;
  if (searchParams.get("status")) { conditions.push(`inv.status=$${i++}`); vals.push(searchParams.get("status")); }
  if (searchParams.get("type")) { conditions.push(`inv.type=$${i++}`); vals.push(searchParams.get("type")); }
  if (searchParams.get("client_id")) { conditions.push(`inv.client_id=$${i++}`); vals.push(searchParams.get("client_id")); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { neon } = await import("@neondatabase/serverless");
  const db = neon(process.env.DATABASE_URL!);
  const res = await db.query(`
    SELECT inv.*, c.company AS client_name, c.tin AS client_tin, c.vrn AS client_vrn,
           COALESCE((SELECT json_agg(ii) FROM invoice_items ii WHERE ii.invoice_id=inv.id),'[]') AS items
    FROM invoices inv LEFT JOIN clients c ON c.id=inv.client_id
    ${where} ORDER BY inv.issue_date DESC
  `, vals);
  return NextResponse.json({ data: (res as unknown as {rows: Record<string,unknown>[]}).rows, total: (res as unknown as {rows: Record<string,unknown>[]}).rows.length });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (!WRITE_ROLES.includes(auth.role)) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  try {
    const { items, ...invoiceData } = schema.parse(await req.json());
    const settings = await sql`SELECT vat_rate,invoice_prefix,quotation_prefix,proforma_prefix FROM app_settings LIMIT 1`;
    const s = (settings[0] ?? {}) as Record<string,unknown>;
    const vatRate = Number(s.vat_rate ?? 18);
    const subtotal = items.reduce((sum, it) => sum + it.quantity * it.rate, 0);
    const vatAmount = Math.round(subtotal * vatRate / 100);
    const total = subtotal + vatAmount;
    const prefix = invoiceData.type === "quotation" ? String(s.quotation_prefix ?? "QT") :
                   invoiceData.type === "proforma" ? String(s.proforma_prefix ?? "PRO") : String(s.invoice_prefix ?? "INV");
    const countRow = await sql`SELECT COUNT(*)::int AS c FROM invoices WHERE type=${invoiceData.type}`;
    const num = String(((countRow[0] as Record<string,number>).c ?? 0) + 1).padStart(4,"0");
    const number = `${prefix}-${new Date().getFullYear()}-${num}`;
    const id = uuid();
    await sql`
      INSERT INTO invoices (id,number,type,client_id,subtotal,vat_rate,vat_amount,total,status,issue_date,due_date,notes,terms,created_by)
      VALUES (${id},${number},${invoiceData.type},${invoiceData.client_id},${subtotal},${vatRate},${vatAmount},${total},
              'draft',${invoiceData.issue_date},${invoiceData.due_date},${invoiceData.notes??null},${invoiceData.terms??null},${auth.id})
    `;
    for (const it of items) {
      await sql`INSERT INTO invoice_items (id,invoice_id,description,quantity,rate,amount) VALUES (${uuid()},${id},${it.description},${it.quantity},${it.rate},${it.quantity*it.rate})`;
    }
    const rows = await sql`SELECT inv.*,c.company AS client_name,c.tin AS client_tin,c.vrn AS client_vrn,COALESCE((SELECT json_agg(ii) FROM invoice_items ii WHERE ii.invoice_id=inv.id),'[]') AS items FROM invoices inv LEFT JOIN clients c ON c.id=inv.client_id WHERE inv.id=${id} LIMIT 1`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Validation failed", details: err.issues.map(e=>`${e.path}: ${e.message}`) }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
