import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not configured. Set it in Vercel environment variables.");
    _sql = neon(url);
  }
  return _sql;
}

// Tagged template proxy — lazy-initializes the connection on first use
export const sql = new Proxy({} as NeonQueryFunction<false, false>, {
  apply(_target, _thisArg, args: [TemplateStringsArray, ...unknown[]]) {
    const db = getDb();
    return (db as unknown as (...a: unknown[]) => unknown)(...args);
  },
  get(_target, prop) {
    const db = getDb();
    return (db as unknown as Record<string, unknown>)[prop as string];
  },
}) as NeonQueryFunction<false, false>;

