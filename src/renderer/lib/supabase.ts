import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: { url: string; client: SupabaseClient } | null = null;

export function getSupabaseClient(url: string, anonKey: string): SupabaseClient {
  if (cached && cached.url === url) return cached.client;
  const client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'momentum.auth',
    },
  });
  cached = { url, client };
  return client;
}

export function clearSupabaseCache(): void {
  cached = null;
}
