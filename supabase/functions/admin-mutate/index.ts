// Admin-only proxy for all CMS reads/writes.
// Authenticates via the signed token issued by admin-auth (HMAC over SERVICE_ROLE_KEY).
// All DB calls run with the service role, bypassing RLS.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const enc = new TextEncoder();

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  let s = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function verifyToken(token: string, secret: string) {
  const [payload, sig] = (token || "").split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(secret, payload);
  if (!timingSafeEqual(sig, expected)) return false;
  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

const ALLOWED_TABLES = new Set([
  "songs",
  "events",
  "merch",
  "donations",
  "artist_profile",
  "listens",
  "mailing_list",
]);

const ALLOWED_BUCKETS = new Set([
  "song-audio",
  "song-art",
  "merch-images",
  "event-covers",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = await req.json().catch(() => ({} as any));
    const { token, op, table, payload, id, bucket, path } = body || {};

    const ok = await verifyToken(String(token ?? ""), SERVICE_ROLE);
    if (!ok) return json({ error: "Unauthorized" }, 401);

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Storage signed upload URL
    if (op === "storage.signedUploadUrl") {
      if (!ALLOWED_BUCKETS.has(String(bucket))) return json({ error: "Bad bucket" }, 400);
      if (!path || typeof path !== "string") return json({ error: "Bad path" }, 400);
      const { data, error } = await sb.storage.from(bucket).createSignedUploadUrl(path);
      if (error) return json({ error: error.message }, 400);
      const { data: pub } = sb.storage.from(bucket).getPublicUrl(path);
      return json({ ...data, publicUrl: pub.publicUrl });
    }

    if (op === "stats") {
      const [songs, events, merch, donations, listens] = await Promise.all([
        sb.from("songs").select("id, title, artist, thumbnail_path, play_count, likes_count, support_fund_cents"),
        sb.from("events").select("id, status, event_date"),
        sb.from("merch").select("id, active, stock"),
        sb.from("donations").select("amount_cents, source, created_at"),
        sb.from("listens").select("song_id, country, region, city, device, source, created_at").order("created_at", { ascending: false }).limit(5000),
      ]);
      return json({
        songs: songs.data ?? [],
        events: events.data ?? [],
        merch: merch.data ?? [],
        donations: donations.data ?? [],
        listens: listens.data ?? [],
      });
    }

    // Generic table ops
    if (!ALLOWED_TABLES.has(String(table))) return json({ error: "Bad table" }, 400);

    if (op === "list") {
      // artist_profile has no created_at column
      const orderCol = table === "artist_profile" ? "updated_at" : "created_at";
      const { data, error } = await sb.from(table).select("*").order(orderCol, { ascending: false });
      if (error) return json({ error: error.message }, 400);

      // Auto-seed a default artist_profile row so the Settings page always works
      if (table === "artist_profile" && (!data || data.length === 0)) {
        const { data: created, error: insErr } = await sb
          .from("artist_profile")
          .insert({ bio: "", socials: {}, player_layout: "normal" })
          .select()
          .single();
        if (insErr) return json({ error: insErr.message }, 400);
        return json({ data: [created] });
      }
      return json({ data });
    }

    if (op === "insert") {
      const { data, error } = await sb.from(table).insert(payload).select().single();
      if (error) return json({ error: error.message }, 400);
      return json({ data });
    }

    if (op === "update") {
      if (!id) return json({ error: "Missing id" }, 400);
      const { data, error } = await sb.from(table).update(payload).eq("id", id).select().single();
      if (error) return json({ error: error.message }, 400);
      return json({ data });
    }

    if (op === "delete") {
      if (!id) return json({ error: "Missing id" }, 400);
      const { error } = await sb.from(table).delete().eq("id", id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }
    return json({ error: "Unknown op" }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
