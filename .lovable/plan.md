
# Campaigns Module — Offline Marketing & Tracking

A fully modular Admin → Campaigns area + a public `/c/:code` redirect route that records a scan, then forwards the visitor to the chosen destination. No changes to existing music, release, analytics, or library code — campaigns reference existing records by id only.

## 1. Database (new tables only)

```text
campaigns
├─ id uuid pk
├─ code text unique         -- short, random, non-sequential (e.g. 8R4FKQ)
├─ name text
├─ type text                -- poster|flyer|billboard|business_card|sticker|
│                              nfc_card|nfc_poster|clothing|merch|vehicle_wrap|
│                              event_booth|social|email|other
├─ status text              -- draft|active|paused|ended
├─ start_date date null
├─ end_date date null
├─ budget_cents int null
├─ notes text
├─ destination_kind text    -- song|release|artist|playlist|merch|event|external
├─ destination_id uuid null -- references existing record id (no FK enforced; loose link)
├─ destination_url text null-- for external or computed final URL
├─ created_at, updated_at

campaign_events                     (one row per scan/visit)
├─ id uuid pk
├─ campaign_id uuid → campaigns.id (cascade)
├─ visitor_hash text       -- sha256(ip+ua+campaign) for unique/repeat detection
├─ is_unique bool
├─ session_id text
├─ referral_method text    -- qr|nfc|short_link|direct
├─ ip text, country, region, city, latitude, longitude
├─ device, browser, os
├─ response_ms int
├─ user_agent text
├─ created_at
```

RLS: only `service_role` writes; `authenticated` (admin) reads via `admin-mutate`. Public inserts happen through the edge function with service role.

Indexes: `campaigns(code)` unique, `campaign_events(campaign_id, created_at desc)`, `campaign_events(visitor_hash)`.

## 2. Edge functions

- `campaign-track` (public, verify_jwt=false): `POST { code }` → loads campaign, derives geo/device from IP + UA, inserts `campaign_events`, returns `{ destination_url }`. Validates that `destination_url` is either same-origin or a vetted external URL (allowlist scheme http/https, reject `javascript:` etc.).
- `admin-mutate`: extend `ALLOWED_TABLES` with `campaigns` and `campaign_events` so admin list/insert/update/delete works through the existing proxy.

## 3. Public redirect route

`/c/:code` → minimal React page that:
1. Calls `campaign-track`
2. `window.location.replace(destination_url)` immediately (with a 250ms fallback timer that still redirects if the call hangs).

Resolves destination URL on the server based on `destination_kind` + `destination_id`:
- song → `/?s=<slug>`
- release/album/ep/single → `/?a=<slug>`
- merch / event / artist / playlist → corresponding existing front routes
- external → `destination_url` as-is

## 4. Admin UI (`src/admin/modules/Campaigns/`)

Tabs inside the module (sub-nav, not a sidebar change beyond adding "Campaigns"):

- **Dashboard** — totals, active count, top campaigns, recent activity, top locations/devices/browsers, scans-over-time chart.
- **All Campaigns** — searchable table; row click → detail.
- **Create / Edit** — form with all fields; destination picker that loads existing songs/releases/merch/events from current `stats` payload (no new fetch endpoints).
- **QR Generator** — uses `qrcode` npm lib; PNG + SVG download, print view, copy URL, copy ID, regenerate (rotates `code`).
- **NFC Tools** — displays URL, copy button, simple instructions for NTAG programming.
- **Analytics** — per-campaign and global; timeline, map (reuse existing `GeographicMap`), traffic sources, recent visits.
- **Detail page** — info, QR preview, tracking URL, destination link, metrics (scans, uniques, repeats, conversion placeholders pulled from existing analytics by destination_id).

Add `Campaigns` to the sidebar in `AdminLayout.tsx` (single new nav entry) and a new tab in `pages/Admin.tsx`.

## 5. Security

- `code` = 8-char base32 from `crypto.getRandomValues` (collision-checked on insert).
- Destination URL validation in `campaign-track`: scheme allowlist, length cap, no embedded credentials.
- Rate limit per IP in the function (in-memory token bucket per cold start — acknowledged as best-effort, matching existing project pattern).
- All admin writes go through `admin-mutate` (already auth-gated).

## 6. Files to add / touch

Add:
- `supabase/functions/campaign-track/index.ts`
- `src/admin/modules/Campaigns/index.tsx` (+ subcomponents: `CampaignList`, `CampaignForm`, `CampaignDetail`, `QrPanel`, `NfcPanel`, `CampaignAnalytics`, `CampaignDashboard`)
- `src/pages/CampaignRedirect.tsx`
- `src/admin/lib/campaignsApi.ts`
- Migration creating the two tables + grants + RLS + indexes.

Touch (minimal):
- `src/admin/AdminLayout.tsx` — add `Campaigns` nav item.
- `src/pages/Admin.tsx` — lazy import + tab branch.
- `src/App.tsx` — add `/c/:code` route.
- `supabase/functions/admin-mutate/index.ts` — extend `ALLOWED_TABLES`.
- `package.json` — add `qrcode` + `ua-parser-js`.

No existing music/release/analytics files are modified.

## 7. Out of scope (call out before building)

- Per-event "conversion" attribution (song play, donation, signup) is shown as **placeholders wired to existing analytics filtered by destination_id**; deeper attribution (cookie-based cross-session funnel) is a follow-up.
- Server-side rate limiting beyond best-effort in-function — project has no shared limiter.
- Auth on `/c/:code` — public by design.

Approve and I'll build it end-to-end starting with the migration.
