import { createClient } from '@supabase/supabase-js';


// Read from Vite environment variables (loaded from .env.local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Make sure .env.local contains:\n' +
    'VITE_SUPABASE_URL=your_project_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_anon_key'
  );
}

// Capacitor Preferences storage adapter (native apps only)
// Uses window.Capacitor global — no import of @capacitor/core needed
// so the web bundle is completely unaffected.
function getCapacitorStorage(): { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void; } | undefined {
  try {
    const w = window as any;
    if (w.Capacitor && typeof w.Capacitor.isNativePlatform === 'function' && w.Capacitor.isNativePlatform()) {
      const prefs = w.Capacitor?.Plugins?.Preferences;
      if (prefs && typeof prefs.getItem === 'function') {
        // In-memory cache to make Capacitor Preferences synchronous for Supabase
        const cache: Record<string, string> = {};

        // Pre-populate cache from Capacitor storage
        const initCache = async () => {
          try {
            const keys = ['sb-access-token', 'sb-refresh-token'];
            for (const key of keys) {
              const result = await prefs.getItem({ key });
              if (result && result.value) {
                cache[key] = result.value;
              }
            }
          } catch {
            // Ignore init errors
          }
        };
        initCache();

        return {
          getItem: (key: string) => {
            if (key in cache) return cache[key];
            // Async fetch for uncached keys, update cache
            prefs.getItem({ key }).then((result: any) => {
              if (result && result.value) {
                cache[key] = result.value;
              }
            }).catch(() => {});
            return cache[key] ?? null;
          },
          setItem: (key: string, value: string) => {
            cache[key] = value;
            prefs.setItem({ key, value }).catch(() => {});
          },
          removeItem: (key: string) => {
            delete cache[key];
            prefs.removeItem({ key }).catch(() => {});
          },
        };
      }
    }
  } catch {
    // Not in Capacitor — fall through to localStorage
  }
  return undefined;
}

const storage = getCapacitorStorage();

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      storage: storage || undefined,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
