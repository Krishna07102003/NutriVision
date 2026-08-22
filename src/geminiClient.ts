import { supabase } from './supabaseClient';

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

function getFriendlyError(status: number, message: string): string {
  if (status === 429) {
    return 'AI is busy right now. Please wait 30 seconds and try again.';
  }
  if (status === 403) {
    return 'AI access denied. Please check your API key settings.';
  }
  if (status === 404) {
    return 'AI model unavailable. Please try again later.';
  }
  if (status >= 500) {
    return 'AI service is temporarily down. Please try again in a minute.';
  }
  if (message.includes('SAFETY')) {
    return 'The AI could not respond to this request. Please try rephrasing.';
  }
  if (message.includes('RECITATION')) {
    return 'AI response blocked. Please try a different prompt.';
  }
  return message || 'Something went wrong with the AI. Please try again.';
}

/**
 * Call the Supabase Edge Function which holds the Gemini API key server-side.
 * The API key is NEVER exposed to the browser.
 */
async function callEdgeFunction(prompt: string, image?: { mimeType: string; data: string }): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('Supabase is not configured.');

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const url = `${supabaseUrl}/functions/v1/ai`;

  const body: Record<string, unknown> = { prompt };
  if (image) {
    body.image = image;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const rawMessage = err?.error || err?.message || `Edge Function error: ${res.status}`;
    throw new Error(getFriendlyError(res.status, rawMessage));
  }

  const data = await res.json();
  const text = data?.text || data?.response;
  if (!text) throw new Error('AI could not generate a response. Please try again.');
  return text;
}

async function callWithRetry(prompt: string, image?: { mimeType: string; data: string }): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await callEdgeFunction(prompt, image);
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Only retry on rate limit (429) and server errors (5xx)
      const isRetryable = lastError.message?.includes('429') || lastError.message?.includes('5');
      if (!isRetryable || attempt === MAX_RETRIES) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = BASE_DELAY * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

export async function askGemini(prompt: string): Promise<string> {
  return callWithRetry(prompt);
}

export async function askGeminiVision(mimeType: string, base64: string, prompt: string): Promise<string> {
  return callWithRetry(prompt, { mimeType, data: base64 });
}
