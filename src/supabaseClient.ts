import { createClient } from '@supabase/supabase-js';

// Read from Vite environment variables (loaded from .env.local)
// These are prefixed with VITE_ so Vite injects them at build time.
// The anon key is safe for client-side use with Supabase RLS.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Make sure .env.local contains:\n' +
    'VITE_SUPABASE_URL=your_project_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_anon_key'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
