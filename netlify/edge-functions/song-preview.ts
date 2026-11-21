import type { Config, Context } from '@netlify/edge-functions';
import { supabaseUrl, supabaseKey } from './song-preview-config.ts';

type Song = { id: string; slug: string | null; title: string; artist: string; thumbnail_path: string | null; hidden: boolean };
type ReleaseTrack = { release: { cover_path: string | null; visibility: string } | null };

const escapeAttribute = (value: string) => value.replace(/[&"'<>]/g, (char) => ({
  '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;',
}[char] || char));

const coverUrl = (path: string | null, base: string): string | null => {
  if (!path) return null;
  if (path.startsWith('https://')) return path;
  if (path.startsWith('/lovable-uploads/')) return `https://draiirynell.com${path}`;
  if (!['covers/', 'defaults/', 'release-covers/'].some((prefix) => path.startsWith(prefix))) return null;
  return `${base}/storage/v1/object/public/song-art/${path.split('/').map(encodeURIComponent).join('/')}`;
};

export default async (request: Request, context: Context) => {
  if (request.method !== 'GET') return;
  const path = new URL(request.url).pathname;
  const slug = decodeURIComponent(path.slice(1));
  if (!/^[a-zA-Z0-9_-]+$/.test(slug) || slug === 'admin') return;

  const base = Netlify.env.get('SONG_PREVIEW_SUPABASE_URL') || supabaseUrl;
  const key = Netlify.env.get('SONG_PREVIEW_SUPABASE_KEY') || supabaseKey;
  if (!base || !key) return;

  try {
    const headers = { apikey: key, Authorization: `Bearer ${key}` };
    const filter = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/.test(slug) ? `or=(slug.eq.${encodeURIComponent(slug)},id.eq.${encodeURIComponent(slug)})` : `slug=eq.${encodeURIComponent(slug)}`;
    const songResponse = await fetch(`${base}/rest/v1/songs?select=id,slug,title,artist,thumbnail_path,hidden&${filter}&limit=1`, { headers });
    if (!songResponse.ok) return;
    const song = ((await songResponse.json()) as Song[])[0];
    if (!song || song.hidden) return;

    let image = coverUrl(song.thumbnail_path, base);
    if (!image) {
      const releaseResponse = await fetch(`${base}/rest/v1/release_tracks?select=release:releases(cover_path,visibility)&song_id=eq.${encodeURIComponent(song.id)}&hidden=eq.false&limit=10`, { headers });
      if (releaseResponse.ok) {
        const tracks = (await releaseResponse.json()) as ReleaseTrack[];
        image = tracks.map((track) => track.release).filter((release) => release && release.visibility !== 'private').map((release) => coverUrl(release!.cover_path, base)).find(Boolean) || null;
      }
    }
    if (!image) {
      const profileResponse = await fetch(`${base}/rest/v1/artist_profile?select=default_cover_url&limit=1`, { headers });
      if (profileResponse.ok) {
        const profile = (await profileResponse.json()) as { default_cover_url: string | null }[];
        image = coverUrl(profile[0]?.default_cover_url || null, base);
      }
    }
    if (!image) return;

    const response = await context.next();
    if (!response.ok || !(response.headers.get('content-type') || '').includes('text/html')) return response;
    let html = await response.text();
    const title = escapeAttribute(`${song.title} — ${song.artist} | Draii Rynell`);
    const description = escapeAttribute(`Listen to ${song.title} by ${song.artist} on Draii Rynell.`);
    const imageTag = escapeAttribute(image);
    const url = escapeAttribute(new URL(request.url).origin + path);
    html = html.replace(/<meta\s+(?:property="og:(?:image(?::type)?|title|description|url|type)"|name="twitter:(?:image|title|description|card)")[^>]*>\s*/gi, '');
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
    html = html.replace('</head>', `<meta property="og:type" content="music.song" />\n<meta property="og:url" content="${url}" />\n<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${description}" />\n<meta property="og:image" content="${imageTag}" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${description}" />\n<meta name="twitter:image" content="${imageTag}" />\n</head>`);
    const result = new Response(html, response);
    result.headers.delete('content-length');
    result.headers.set('cache-control', 'public, max-age=0, s-maxage=300');
    return result;
  } catch (error) {
    console.error('Song preview metadata unavailable', error);
  }
};

export const config: Config = { path: '/:slug' };
