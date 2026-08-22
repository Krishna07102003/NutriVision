// ============================================================
// Centralized Input Validation & Sanitization
// ============================================================

/** Strip HTML tags, script blocks, and dangerous characters */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/javascript:/gi, '')       // strip javascript: URIs
    .replace(/on\w+\s*=/gi, '')        // strip on* event handlers
    .replace(/data:text\/html/gi, '')   // strip data: HTML URIs
    .trim();
}

/** Validate email format (RFC 5322 simplified) */
export function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(email) && email.length <= 254;
}

/** Validate phone number (E.164 format: +<country><number>) */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  return /^\+[1-9]\d{6,14}$/.test(cleaned);
}

/** Validate OTP (exactly 6 digits) */
export function isValidOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/** Validate and clamp a numeric string within bounds */
export function clampNumber(value: string, min: number, max: number): number {
  const num = parseFloat(value);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
}

/** Validate weight (20–300 kg, max 1 decimal) */
export function isValidWeight(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 20 && num <= 300 && /^\d+(\.\d{0,1})?$/.test(value);
}

/** Validate height (50–250 cm, max 1 decimal) */
export function isValidHeight(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 50 && num <= 250 && /^\d+(\.\d{0,1})?$/.test(value);
}

/** Validate age (10–120, integer) */
export function isValidAge(value: string): boolean {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 10 && num <= 120 && /^\d+$/.test(value);
}

/** Validate calories (1–5000) */
export function isValidCalories(value: number): boolean {
  return Number.isFinite(value) && value > 0 && value < 5000;
}

/** Validate macro grams (0–1000) */
export function isValidMacro(value: number, max = 1000): boolean {
  return Number.isFinite(value) && value >= 0 && value <= max;
}

/** Validate food name (non-empty, no injection chars, max 200 chars) */
export function isValidFoodName(name: string): boolean {
  const cleaned = sanitizeText(name);
  return cleaned.length > 0 && cleaned.length <= 200 && !/[<>&"'`;]/.test(cleaned);
}

/** Validate serving size string (max 100 chars) */
export function isValidServing(serving: string): boolean {
  return sanitizeText(serving).length <= 100;
}

/** Validate name (non-empty, sanitized, max 100 chars) */
export function isValidName(name: string): boolean {
  const cleaned = sanitizeText(name);
  return cleaned.length > 0 && cleaned.length <= 100;
}

/** Validate chat message (non-empty, max 2000 chars) */
export function isValidChatMessage(msg: string): boolean {
  const cleaned = sanitizeText(msg);
  return cleaned.length > 0 && cleaned.length <= 2000;
}

/** Validate file upload: type, size, extension */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and HEIC images are allowed.' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Image must be under 10 MB.' };
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'Invalid file extension.' };
  }

  // Reject filenames with path traversal or special chars
  if (/[<>:"|?*]/.test(file.name) || file.name.includes('..')) {
    return { valid: false, error: 'Invalid filename.' };
  }

  return { valid: true };
}

/** Sanitize a Supabase storage path to prevent path traversal */
export function sanitizeStoragePath(path: string): string {
  return path
    .replace(/[^a-zA-Z0-9._\-/]/g, '')  // only allow safe chars
    .replace(/\.\./g, '')                 // no parent traversal
    .replace(/^\/+/, '')                  // no leading slashes
    .substring(0, 255);                   // max length
}

/** Validate goal option against allowed list */
export function isValidGoal(goal: string): boolean {
  const allowed = ['weight-loss', 'weight-gain', 'muscle-gain', 'maintenance', 'healthy-eating', 'athletic-performance'];
  return allowed.includes(goal);
}

/** Validate diet type against allowed list */
export function isValidDietType(diet: string): boolean {
  const allowed = ['vegetarian', 'non-vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo'];
  return allowed.includes(diet);
}

/** Validate activity level against allowed list */
export function isValidActivityLevel(level: string): boolean {
  const allowed = ['sedentary', 'light', 'moderate', 'very', 'extra'];
  return allowed.includes(level);
}

/** Validate gender */
export function isValidGender(gender: string): boolean {
  return ['male', 'female'].includes(gender);
}

/** Generic form field validator — returns first error or null */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) return `${fieldName} is required.`;
  return null;
}
