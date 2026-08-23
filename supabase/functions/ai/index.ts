import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ===== Server-side Rate Limiter =====
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = {
  maxRequests: 15,
  windowMs: 60 * 1000,
};

function checkServerRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (rateLimitStore.size > 1000) {
    for (const [key, val] of rateLimitStore) {
      if (val.resetAt < now) rateLimitStore.delete(key);
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

const MAX_PROMPT_LENGTH = 4000;
const MAX_IMAGE_SIZE_MB = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authHeader.replace("Bearer ", "").substring(0, 50);

    // Check URL path for different endpoints
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop() || "";

    // ===== FOOD SEARCH PROXY (no rate limit — lightweight) =====
    if (path === "food-search" && req.method === "GET") {
      const query = url.searchParams.get("q");
      if (!query || query.length < 2) {
        return new Response(JSON.stringify({ products: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15&fields=product_name,brands,nutriments,nutrition_grades,serving_size`;

      const res = await fetch(searchUrl, {
        headers: { "User-Agent": "NutriVision/1.0 (contact: nutrition@example.com)" },
      });

      if (!res.ok) {
        return new Response(JSON.stringify({ products: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await res.json();
      return new Response(JSON.stringify({ products: data.products || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== AI ENDPOINT =====
    const rateCheck = checkServerRateLimit(userId);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({
        error: `Rate limit exceeded. Try again in ${rateCheck.retryAfter} seconds.`,
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(rateCheck.retryAfter),
        },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);

    const models = ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let model = null;

    for (const modelName of models) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        break;
      } catch {
        continue;
      }
    }

    if (!model) {
      throw new Error("No available Gemini model.");
    }

    const { prompt, image } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return new Response(JSON.stringify({
        error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters.`,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (image) {
      if (!image.mimeType || !image.data) {
        return new Response(JSON.stringify({ error: "Invalid image format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const estimatedSizeMB = (image.data.length * 0.75) / (1024 * 1024);
      if (estimatedSizeMB > MAX_IMAGE_SIZE_MB) {
        return new Response(JSON.stringify({
          error: `Image too large. Maximum ${MAX_IMAGE_SIZE_MB}MB.`,
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const generationConfig = {
      maxOutputTokens: 8192,
      temperature: 0.7,
    };

    let result;

    if (image) {
      result = await model.generateContent([
        { inlineData: { mimeType: image.mimeType, data: image.data } },
        prompt,
      ], { generationConfig });
    } else {
      result = await model.generateContent(prompt, { generationConfig });
    }

    const text = result.response.text();

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
