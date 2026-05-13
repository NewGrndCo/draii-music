
# Draii.io Admin CMS — Build Plan

A full glassmorphism dark-mode admin at `/admin` (already gated by the existing password guard). Below is what exists today, what needs to be created, and how I'll ship it in phases so you can review as we go.

## What's already in place
- `/admin` route protected by `AdminGuard` (password + signed token).
- `songs` table (47 rows imported) with: title, artist, duration, file_path, thumbnail_path, category, genre, bpm, play_count, likes_count, status, visibility.
- `mailing_list` table (RLS locked down).
- Audio + thumbnails served from the legacy storage bucket.

## What's missing and needs to be created
You mentioned "existing edge functions (upload-song, increment-play-count, track-listen)" and several modules whose tables/buckets don't exist in this project yet. I'll build them.

**New database tables (with RLS):**
- `songs` — add columns: `is_collaboration` (bool), `guest_artists` (text[]), `support_fund_cents` (int), `release_date` (already exists).
- `events` — date, time, location, ticket_url, status, cover_image.
- `merch` — name, description, price_cents, stock, image_url, active.
- `donations` — amount_cents, source ('stripe'|'crypto'|'pwyw'), song_id, created_at.
- `listens` — song_id, country, city, device, source, created_at (powers the heatmap, device/traffic charts).
- `artist_profile` — single-row table for bio, socials (jsonb), player_layout ('normal'|'wide').

**New storage buckets:**
- `song-audio` (public read, admin write) — for the bulk uploader.
- `song-art`, `merch-images`, `event-covers` (public read, admin write).

**New edge functions:**
- `upload-song` — signed admin token required, uploads file + creates row.
- `increment-play-count` — bumps `play_count` on a song.
- `track-listen` — inserts a `listens` row (geo via `cf-ipcountry` header).
- `admin-mutate` — guarded write proxy used by the CMS for all create/update/delete (since admin uses a password token, not Supabase auth).

## Frontend modules

```
/admin
 ├─ Sidebar:  Dashboard · Library · Analytics · Events · Merch · Settings
 └─ Header:   "DR Admin Control Center"  +  status pills (Stripe / Spotify / DB)
```

1. **Dashboard** — KPI cards (total songs, total plays, total likes, support fund total, upcoming events, active merch).
2. **Library** — sortable/searchable data table of songs with inline edit, delete, collaboration toggle + guest-artist chips, support-fund column. Bottom drag-and-drop bulk uploader (MP3/WAV) with per-file metadata form.
3. **Analytics** — world heatmap (react-simple-maps), real-time plays/likes/listeners, donations breakdown (Stripe / Crypto / PWYW) + growth line chart, device + traffic-source pies. Real-time via Supabase channel on `listens`.
4. **Events** — table with Date, Time, Location, Ticket URL, Active/Expired toggle, cover upload. Side panel "Upcoming Events Preview" rendered exactly like the frontend will show it.
5. **Merch** — grid + table for products (image, name, price, stock, active toggle). Side panel "Active Merch Slider Preview" mirroring frontend slider.
6. **Settings** — Artist bio editor, socials (Twitter, YouTube, Instagram, TikTok, Spotify, Apple Music), player layout switch (Normal / Wide), publishes immediately to the public player.

## Design system
- Dark base, purple → blue gradients (already in tokens).
- Glassmorphism: `backdrop-blur`, translucent surfaces, soft borders, subtle inner glow. New tokens added to `index.css` (`--glass-bg`, `--glass-border`, `--gradient-purple-blue`, etc.) — no hardcoded colors in components.
- Fully responsive: sidebar collapses to icon rail on mobile, tables become card-stacks below `md`.

## Frontend wiring to existing player
- `is_collaboration` + `guest_artists` flow into the existing collaborations album logic in `useMusicLibrary`.
- `player_layout` from `artist_profile` controls a new wrapper around `PlayerCore` (Normal vs Wide).
- The frontend player calls `track-listen` on play start and `increment-play-count` on song-end.

## Phases (each phase = one approval/preview cycle)

1. **Schema + storage + edge functions** — migration for all new tables, buckets, RLS, and the four edge functions.
2. **Admin shell** — sidebar, header, glass theme tokens, status pills, routing, responsive layout.
3. **Library module** — songs table, inline edit, collab toggle, bulk uploader.
4. **Analytics module** — heatmap, KPIs, donations, device/source charts, realtime.
5. **Events + Merch modules** — tables, editors, live previews, frontend surfaces.
6. **Settings + frontend integration** — bio/socials/layout, wire `track-listen` + `increment-play-count` into the player, render Wide layout.

## Notes / things I'll assume unless you say otherwise
- Stripe / Spotify status pills: I'll show "Not connected" for now; we can wire real health checks once those integrations are added.
- "Support Fund" per song = sum of `donations` rows for that song (computed view), plus a manual override field.
- Donations page is read-only in the CMS (donations come from Stripe webhooks once you enable payments — I can wire that in a later pass).
- Bulk uploader will be capped at ~20 files / 100 MB per file to stay within edge-function limits.

Approve this and I'll start with **Phase 1 (schema + edge functions)** so the rest has something real to talk to.
