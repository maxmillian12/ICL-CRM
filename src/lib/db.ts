import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Create a factory that initializes on demand (safe for serverless build-time)
function createSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your Vercel environment variables."
    );
  }
  return neon(url);
}

// Export a function so each API route gets a fresh connection per request
export function getDb(): NeonQueryFunction<false, false> {
  return createSql();
}

// Convenience shorthand for tagged template queries
export async function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const db = createSql();
  return db(strings, ...values) as Promise<T[]>;
}

