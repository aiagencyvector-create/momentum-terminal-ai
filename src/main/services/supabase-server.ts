import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublic, getSupabaseServiceKey } from './secrets';

let cached: { url: string; client: SupabaseClient } | null = null;

export class MissingSupabaseConfigError extends Error {
  constructor(missing: string) {
    super(`Supabase ${missing} não configurado. Configure em Settings.`);
  }
}

export function getSupabaseServiceClient(): SupabaseClient {
  const { url } = getSupabasePublic();
  const serviceKey = getSupabaseServiceKey();
  if (!url) throw new MissingSupabaseConfigError('URL');
  if (!serviceKey) throw new MissingSupabaseConfigError('service role key');

  if (cached && cached.url === url) return cached.client;

  const client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  cached = { url, client };
  return client;
}

export function clearSupabaseClientCache(): void {
  cached = null;
}
