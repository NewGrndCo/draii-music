// Public campaign tracking endpoint.
// Records a scan event, then returns the resolved destination URL.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { UAParser } from "https://esm.sh/ua-parser-js@2.0.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function detectReferral(ua: string, referrer: string): string {
  const u = ua.toLowerCase();
  // Heuristic: NFC taps often come from system browsers with no referrer.
  if (!referrer && /android|iphone|ipad/.test(u)) return "nfc";
  if (!referrer) return "qr";
  return "short_link";
}

function isSafeUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return false;
    if (u.username || u.password) return false;
    if (raw.length > 2000) return false;
    return true;
  } catch {
    return false;
  }
}

async function resolveDestination(
  sb: ReturnType<typeof createClient>,
  kind: string,
  id: string | null,
  url: string | null,
  origin: string,
): Promise<string | null> {
  if (kind === "external" && url) return isSafeUrl(url) ? url : null;
  if (!id) return origin || "/";

  if (kind === "song") {
    const { data } = await sb.from("songs").select("slug, id").eq("id", id).maybeSingle();
    if (!data) return origin;
    return `${origin}/?s=${encodeURIComponent(data.slug || data.id)}`;
  }
  if (kind === "release" || kind === "album" || kind === "ep" || kind === "single") {
    const { data } = await sb.from("releases").select("slug, id").eq("id", id).maybeSingle();
    if (!data) return origin;
    return `${origin}/?a=${encodeURIComponent(data.slug || data.id)}`;
  }
  if (kind === "merch") return `${origin}/?m=${encodeURIComponent(id)}`;
  if (kind === "event") return `${origin}/?e=${encodeURIComponent(id)}`;
  if (kind === "artist" || kind === "playlist") return origin;
  return origin;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const t0 = performance.now();
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const json = (d: unknown, s = 200) =>
    new Response(JSON.stringify(d), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { code, referrer = "", session_id = "" } = await req.json().catch(() => ({}));
    if (!code || typeof code !== "string" || code.length > 32) return json({ error: "Bad code" }, 400);

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    const { data: campaign } = await sb
      .from("campaigns")
      .select("id, status, destination_kind, destination_id, destination_url")
      .eq("code", code)
      .maybeSingle();

    if (!campaign) return json({ error: "Not found" }, 404);
    if (campaign.status === "ended" || campaign.status === "draft") {
      return json({ error: "Inactive" }, 410);
    }

    const ip =
      req.headers.get("cf-connecting-ip") ||
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      "";
    const ua = req.headers.get("user-agent") || "";
    const origin = new URL(req.url).origin.replace(/\/functions\/v1.*/, "");
    const siteOrigin = referrer ? new URL(referrer).origin : origin;

    const destination_url = await resolveDestination(
      sb,
      campaign.destination_kind,
      campaign.destination_id,
      campaign.destination_url,
      siteOrigin,
    );

    // Parse UA
    const parser = new UAParser(ua);
    const dev = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const deviceType = dev.type || (/mobile/i.test(ua) ? "mobile" : "desktop");

    // Geo via ipapi.co (best-effort)
    let geo: any = {};
    if (ip) {
      try {
        const r = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: { "User-Agent": "campaign-track/1.0" },
        });
        if (r.ok) geo = await r.json();
      } catch { /* ignore */ }
    }

    const visitor_hash = await sha256(`${ip}|${ua}|${campaign.id}`);
    const { count } = await sb
      .from("campaign_events")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .eq("visitor_hash", visitor_hash);
    const is_unique = (count || 0) === 0;

    await sb.from("campaign_events").insert({
      campaign_id: campaign.id,
      visitor_hash,
      is_unique,
      session_id: session_id || null,
      referral_method: detectReferral(ua, referrer),
      ip: ip || null,
      country: geo.country_name || null,
      region: geo.region || null,
      city: geo.city || null,
      latitude: typeof geo.latitude === "number" ? geo.latitude : null,
      longitude: typeof geo.longitude === "number" ? geo.longitude : null,
      device: deviceType || null,
      browser: browser.name || null,
      os: os.name || null,
      response_ms: Math.round(performance.now() - t0),
      user_agent: ua.slice(0, 500),
    });

    return json({ destination_url: destination_url || siteOrigin });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
