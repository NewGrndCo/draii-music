// Verifies an admin password and returns a short-lived signed token.
// The token is an HMAC-SHA256 over { exp } using the SUPABASE_SERVICE_ROLE_KEY
// as the signing secret (a server-only value never exposed to the client).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TOKEN_TTL_SECONDS = 60 * 60 * 8; // 8 hours

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  const s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return b64url(new Uint8Array(sig));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let res = 0;
  for (let i = 0; i < a.length; i++) res |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return res === 0;
}

async function issueToken(signingSecret: string) {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = b64url(enc.encode(JSON.stringify({ exp })));
  const sig = await hmac(signingSecret, payload);
  return { token: `${payload}.${sig}`, exp };
}

async function verifyToken(token: string, signingSecret: string) {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(signingSecret, payload);
  if (!timingSafeEqual(sig, expected)) return false;
  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
  const SIGNING_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!ADMIN_PASSWORD || !SIGNING_SECRET) {
    return new Response(
      JSON.stringify({ error: "Server not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action ?? "login";

    if (action === "login") {
      const password = typeof body.password === "string" ? body.password : "";
      if (password.length === 0 || password.length > 256) {
        return new Response(JSON.stringify({ error: "Invalid password" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // constant-time compare
      const a = enc.encode(password);
      const b = enc.encode(ADMIN_PASSWORD);
      let ok = a.length === b.length;
      const len = Math.max(a.length, b.length);
      let diff = a.length ^ b.length;
      for (let i = 0; i < len; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
      ok = ok && diff === 0;

      if (!ok) {
        return new Response(JSON.stringify({ error: "Invalid password" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const issued = await issueToken(SIGNING_SECRET);
      return new Response(JSON.stringify(issued), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      const token = typeof body.token === "string" ? body.token : "";
      const valid = await verifyToken(token, SIGNING_SECRET);
      return new Response(JSON.stringify({ valid }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
