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

// ---- Capacitor session persistence ----
// Capacitor's Android WebView does NOT persist localStorage between app restarts.
// We use Capacitor.Preferences (native persistent storage) as the source of truth
// and mirror reads/writes to localStorage so Supabase works.
//
// Strategy: Lazy-load from Preferences on first getItem(), write to both on setItem().
// The cache is populated asynchronously from Preferences, but getItem() returns
// whatever is cached so far (which may be empty on cold start).
// useAuth.ts handles the case where session is not immediately available.
function createCapacitorStorage() {
  try {
    const w = window as any;
    if (!w.Capacitor || typeof w.Capacitor.isNativePlatform !== 'function' || !w.Capacitor.isNativePlatform()) {
      return undefined;
    }
    const prefs = w.Capacitor?.Plugins?.Preferences;
    if (!prefs || typeof prefs.getItem !== 'function') return undefined;

    const SUPABASE_KEYS = ['sb-access-token', 'sb-refresh-token', 'sb-anon-key'];
    const cache: Record<string, string> = {};
    let loaded = false;

    // Async pre-load all known Supabase keys from native storage
    (async () => {
      try {
        for (const key of SUPABASE_KEYS) {
          const result = await prefs.getItem({ key });
          if (result?.value) {
            cache[key] = result.value;
            // Also ensure localStorage has it (for any code that reads localStorage directly)
            localStorage.setItem(key, result.value);
          }
        }
        loaded = true;
      } catch {
        loaded = true;
      }
    })();

    return {
      getItem: (key: string): string | null => {
        // Return from cache if available, otherwise fall back to localStorage
        if (key in cache) return cache[key];
        const ls = localStorage.getItem(key);
        if (ls) {
          cache[key] = ls;
          return ls;
        }
        return null;
      },
      setItem: (key: string, value: string): void => {
        cache[key] = value;
        // Write to both localStorage and native Preferences
        localStorage.setItem(key, value);
        prefs.setItem({ key, value }).catch(() => {});
      },
      removeItem: (key: string): void => {
        delete cache[key];
        localStorage.removeItem(key);
        prefs.removeItem({ key }).catch(() => {});
      },
      // Expose loaded state so useAuth can wait for it
      isLoaded: () => loaded,
      waitForLoad: () => new Promise<void>((resolve) => {
        if (loaded) { resolve(); return; }
        const check = setInterval(() => {
          if (loaded) { clearInterval(check); resolve(); }
        }, 50);
        // Safety timeout: resolve after 2 seconds regardless
        setTimeout(() => { clearInterval(check); resolve(); }, 2000);
      }),
    };
  } catch {
    return undefined;
  }
}

export const capacitorStorage = createCapacitorStorage();

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      storage: capacitorStorage || undefined,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
