// Records a listen event for analytics. Public endpoint.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (d: unknown, s = 200) =>
    new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json().catch(() => ({} as any));
    const songId = typeof body.songId === "string" ? body.songId : null;
    const source = typeof body.source === "string" ? body.source.slice(0, 64) : null;

    // Geo + device hints (best effort)
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || null;
    const city = req.headers.get("cf-ipcity") || req.headers.get("x-vercel-ip-city") || null;
    const ua = req.headers.get("user-agent") || "";
    const device = /mobile|iphone|android/i.test(ua) ? "mobile" : "desktop";

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const { error } = await sb.from("listens").insert({
      song_id: songId, country, city, device, source,
    });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
