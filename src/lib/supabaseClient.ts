import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/constants';

/**
 * Cliente Supabase. Si faltan las variables de entorno la app funciona en modo
 * demo local (isSupabaseEnabled === false) y `supabase` queda null.
 */
export const isSupabaseEnabled =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;