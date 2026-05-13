// Increments or decrements likes_count atomically. Public endpoint.
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
    const { songId, liked } = await req.json().catch(() => ({} as any));
    if (typeof songId !== "string" || songId.length < 4) return json({ error: "Bad songId" }, 400);
    const delta = liked ? 1 : -1;

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const { data: cur, error: e1 } = await sb.from("songs").select("likes_count").eq("id", songId).single();
    if (e1) return json({ error: e1.message }, 400);
    const next = Math.max(0, (cur?.likes_count ?? 0) + delta);
    const { error: e2 } = await sb.from("songs").update({ likes_count: next }).eq("id", songId);
    if (e2) return json({ error: e2.message }, 400);
    return json({ likes_count: next });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
