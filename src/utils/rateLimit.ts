/**
 * Client-side Rate Limiter
 * 
 * Uses localStorage to persist rate limit state across page reloads.
 * Protects against brute force attacks, bot abuse, and API spam.
 */

const RATE_LIMIT_KEY = 'nutrivision_rate_limits';

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

function getStore(): RateLimitStore {
  try {
    return JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStore(store: RateLimitStore): void {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(store));
  } catch {
    // Storage full — clear old entries
    const cleaned: RateLimitStore = {};
    const now = Date.now();
    for (const [key, entry] of Object.entries(store)) {
      if (entry.blockedUntil > now || now - entry.firstAttempt < 3600000) {
        cleaned[key] = entry;
      }
    }
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(cleaned));
  }
}

/**
 * Check if an action is rate-limited.
 * Returns { allowed: true } or { allowed: false, retryAfter: seconds }
 */
export function checkRateLimit(
  action: string,
  maxAttempts: number,
  windowMs: number,
  blockDurationMs: number
): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const store = getStore();
  const now = Date.now();
  const entry = store[action];

  // Check if currently blocked
  if (entry && entry.blockedUntil > now) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  // Check if window has expired
  if (entry && now - entry.firstAttempt > windowMs) {
    // Reset counter
    store[action] = { count: 1, firstAttempt: now, lastAttempt: now, blockedUntil: 0 };
    saveStore(store);
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Check if within window
  if (entry && entry.count >= maxAttempts) {
    // Block the user
    store[action] = {
      ...entry,
      blockedUntil: now + blockDurationMs,
      lastAttempt: now,
    };
    saveStore(store);
    const retryAfter = Math.ceil(blockDurationMs / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  // Increment counter
  store[action] = {
    count: (entry?.count || 0) + 1,
    firstAttempt: entry?.firstAttempt || now,
    lastAttempt: now,
    blockedUntil: 0,
  };
  saveStore(store);
  return { allowed: true, remaining: maxAttempts - store[action].count };
}

/**
 * Record a failed attempt (doesn't count toward success limit)
 */
export function recordFailedAttempt(action: string): void {
  const store = getStore();
  const now = Date.now();
  const entry = store[action];

  store[action] = {
    count: (entry?.count || 0) + 1,
    firstAttempt: entry?.firstAttempt || now,
    lastAttempt: now,
    blockedUntil: entry?.blockedUntil || 0,
  };
  saveStore(store);
}

/**
 * Reset rate limit for an action (e.g., after successful login)
 */
export function resetRateLimit(action: string): void {
  const store = getStore();
  delete store[action];
  saveStore(store);
}

/**
 * Clean up expired entries
 */
export function cleanupRateLimits(): void {
  const store = getStore();
  const now = Date.now();
  let changed = false;

  for (const [key, entry] of Object.entries(store)) {
    if (entry.blockedUntil > 0 && entry.blockedUntil < now) {
      delete store[key];
      changed = true;
    } else if (now - entry.firstAttempt > 86400000) {
      // 24 hours old
      delete store[key];
      changed = true;
    }
  }

  if (changed) saveStore(store);
}

// ============ PREDEFINED RATE LIMITS ============

export const RATE_LIMITS = {
  /** Login attempts: 5 per 15 minutes, block for 15 minutes */
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 },

  /** OTP verification: 5 per 10 minutes, block for 10 minutes */
  OTP: { maxAttempts: 5, windowMs: 10 * 60 * 1000, blockDurationMs: 10 * 60 * 1000 },

  /** AI generation (meal plan, chat, insight): 10 per hour, block for 5 minutes */
  AI_GENERATION: { maxAttempts: 10, windowMs: 60 * 60 * 1000, blockDurationMs: 5 * 60 * 1000 },

  /** Meal logging: 30 per hour (prevent spam) */
  MEAL_LOG: { maxAttempts: 30, windowMs: 60 * 60 * 1000, blockDurationMs: 5 * 60 * 1000 },

  /** Form submissions: 10 per 5 minutes */
  FORM_SUBMIT: { maxAttempts: 10, windowMs: 5 * 60 * 1000, blockDurationMs: 5 * 60 * 1000 },

  /** Feedback: 5 per hour */
  FEEDBACK: { maxAttempts: 5, windowMs: 60 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },

  /** Password/OTP resend: 3 per 5 minutes */
  RESEND: { maxAttempts: 3, windowMs: 5 * 60 * 1000, blockDurationMs: 5 * 60 * 1000 },
} as const;

/**
 * Convenience function: check a predefined rate limit
 */
export function checkLimit(action: keyof typeof RATE_LIMITS): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const config = RATE_LIMITS[action];
  return checkRateLimit(action, config.maxAttempts, config.windowMs, config.blockDurationMs);
}
