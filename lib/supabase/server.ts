import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Server-only Supabase client using the service role key. Never import this
 * from a Client Component — it bypasses RLS entirely by design, since this
 * is a single-admin internal tool with no end-user-facing DB access.
 */
export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new SupabaseNotConfiguredError();
  }

  cachedClient = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return cachedClient;
}

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Supabase no esta configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en las variables de entorno."
    );
    this.name = "SupabaseNotConfiguredError";
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
