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
  "release_plans",
  "releases",
  "release_tracks",
  "song_artists",
  "genres",
  "song_genres",
  "expenses",
  "merch_clicks",
  "campaigns",
  "campaign_events",
]);

const NO_CREATED_AT = new Set(["artist_profile", "song_genres", "release_tracks"]);
const ORDER_OVERRIDES: Record<string, { col: string; asc: boolean }> = {
  artist_profile: { col: "updated_at", asc: false },
  song_genres: { col: "song_id", asc: true },
  release_tracks: { col: "release_id", asc: true },
  releases: { col: "created_at", asc: false },
};

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

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: "Admin service is not configured" }, 500);

  try {
    const body = await req.json().catch(() => ({} as any));
    const { token, op, table, payload, id, bucket, path, filter } = body || {};

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
      const [songs, events, merch, donations, listens, mailing, plans, expenses, clicks] = await Promise.all([
        sb.from("songs").select("id, title, artist, thumbnail_path, play_count, likes_count, support_fund_cents"),
        sb.from("events").select("id, status, event_date"),
        sb.from("merch").select("id, name, image_url, price_cents, stock, active"),
        sb.from("donations").select("amount_cents, source, created_at"),
        sb.from("listens").select("song_id, country, region, city, latitude, longitude, device, source, created_at").order("created_at", { ascending: false }).limit(5000),
        sb.from("mailing_list").select("id, email, phone, country, region, city, created_at"),
        sb.from("release_plans").select("*").order("sort_order", { ascending: true }),
        sb.from("expenses").select("*").order("occurred_at", { ascending: false }),
        sb.from("merch_clicks").select("merch_id, song_id, created_at"),
      ]);
      return json({
        songs: songs.data ?? [],
        events: events.data ?? [],
        merch: merch.data ?? [],
        donations: donations.data ?? [],
        listens: listens.data ?? [],
        mailing: mailing.data ?? [],
        releases: plans.data ?? [],
        expenses: expenses.data ?? [],
        merch_clicks: clicks.data ?? [],
      });
    }

    // ---- Composite-PK ops for the music graph ----

    if (op === "release_tracks.list") {
      const release_id = String(payload?.release_id || "");
      if (!release_id) return json({ error: "Missing release_id" }, 400);
      const { data, error } = await sb
        .from("release_tracks")
        .select("release_id, song_id, track_number, disc_number, hidden, songs(id, title, artist, duration, thumbnail_path, file_path, play_count, likes_count)")
        .eq("release_id", release_id)
        .order("disc_number", { ascending: true })
        .order("track_number", { ascending: true });
      if (error) return json({ error: error.message }, 400);
      return json({ data });
    }

    if (op === "release_tracks.upsert") {
      const rows = Array.isArray(payload?.rows) ? payload.rows : null;
      if (!rows) return json({ error: "Missing rows" }, 400);
      const { data, error } = await sb.from("release_tracks").upsert(rows, { onConflict: "release_id,song_id" }).select();
      if (error) return json({ error: error.message }, 400);
      return json({ data });
    }

    if (op === "release_tracks.remove") {
      const release_id = String(payload?.release_id || "");
      const song_id = String(payload?.song_id || "");
      if (!release_id || !song_id) return json({ error: "Missing ids" }, 400);
      const { error } = await sb.from("release_tracks").delete().eq("release_id", release_id).eq("song_id", song_id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (op === "release_tracks.reorder") {
      // payload.rows: [{release_id, song_id, track_number, disc_number}]
      const rows = Array.isArray(payload?.rows) ? payload.rows : null;
      if (!rows) return json({ error: "Missing rows" }, 400);
      // Two-pass to avoid unique(release_id,disc_number,track_number) collisions:
      // first move all to negative track numbers, then to final values.
      const tempRows = rows.map((r: any, i: number) => ({ ...r, track_number: -1 * (i + 1) }));
      const t1 = await sb.from("release_tracks").upsert(tempRows, { onConflict: "release_id,song_id" });
      if (t1.error) return json({ error: t1.error.message }, 400);
      const t2 = await sb.from("release_tracks").upsert(rows, { onConflict: "release_id,song_id" });
      if (t2.error) return json({ error: t2.error.message }, 400);
      return json({ ok: true });
    }

    if (op === "song_artists.list") {
      const song_id = String(payload?.song_id || "");
      if (!song_id) return json({ error: "Missing song_id" }, 400);
      const { data, error } = await sb.from("song_artists").select("*").eq("song_id", song_id).order("sort_order");
      if (error) return json({ error: error.message }, 400);
      return json({ data });
    }

    if (op === "song_genres.set") {
      const song_id = String(payload?.song_id || "");
      const genre_ids: string[] = Array.isArray(payload?.genre_ids) ? payload.genre_ids : [];
      if (!song_id) return json({ error: "Missing song_id" }, 400);
      const del = await sb.from("song_genres").delete().eq("song_id", song_id);
      if (del.error) return json({ error: del.error.message }, 400);
      if (genre_ids.length) {
        const ins = await sb.from("song_genres").insert(genre_ids.map((g) => ({ song_id, genre_id: g })));
        if (ins.error) return json({ error: ins.error.message }, 400);
      }
      return json({ ok: true });
    }

    // ---- Generic table ops ----
    if (!ALLOWED_TABLES.has(String(table))) return json({ error: "Bad table" }, 400);

    if (op === "list") {
      const override = ORDER_OVERRIDES[String(table)];
      const orderCol = override?.col ?? "created_at";
      const ascending = override?.asc ?? false;
      let q = sb.from(table).select("*").order(orderCol, { ascending });
      if (filter && typeof filter === "object") {
        for (const [k, v] of Object.entries(filter)) q = q.eq(k, v as any);
      }
      const { data, error } = await q;
      if (error) return json({ error: error.message }, 400);

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
