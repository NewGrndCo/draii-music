import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Song, Album } from '../data/musicData';
import { toast } from 'sonner';

const SUPABASE_PUBLIC_BASE = import.meta.env.VITE_SUPABASE_URL as string;

const LIBRARY_CACHE_KEY = 'music-library-cache-v10';
const LIBRARY_CACHE_TTL_MS = 5 * 60 * 1000;

export const invalidateMusicLibraryCache = () => {
  try { sessionStorage.removeItem(LIBRARY_CACHE_KEY); } catch { /* ignore */ }
};

const SONG_FIELDS =
  'id,slug,title,artist,duration,file_path,thumbnail_path,play_count,likes_count,category,hidden,dsp_link,is_collaboration,release_date,created_at';

export const useMusicLibrary = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [defaultCover, setDefaultCover] = useState<string | null>(null);

  const getFullImageUrl = useCallback((path?: string | null): string => {
    if (!path) return defaultCover || 'https://images.unsplash.com/photo-1577985051167-0d49eec21977?w=500';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/lovable-uploads')) return path;
    return `${SUPABASE_PUBLIC_BASE}/storage/v1/object/public/song-art/${path}`;
  }, [defaultCover]);

  const formatDuration = useCallback((seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let cancelled = false;

    try {
      const raw = sessionStorage.getItem(LIBRARY_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && Date.now() - cached.t < LIBRARY_CACHE_TTL_MS && Array.isArray(cached.albums)) {
          setAlbums(cached.albums);
          setLoading(false);
          return () => { cancelled = true; };
        }
      }
    } catch { /* ignore */ }

    const detectCollabFromArtist = (artist: string) => {
      const a = (artist || '').toLowerCase();
      return /\bfeat\.?\b|\bft\.?\b|\bfeaturing\b|\bwith\b|&|,/.test(a);
    };

    const toSong = (r: any, overrides: Partial<Song> = {}): Song => ({
      id: r.id,
      slug: r.slug,
      title: r.title || 'Untitled',
      artist: r.artist || 'Unknown Artist',
      album: overrides.album ?? '',
      duration: formatDuration(r.duration || 180),
      coverArt: overrides.coverArt ?? getFullImageUrl(r.thumbnail_path),
      audioSrc: r.file_path || '',
      playCount: r.play_count ?? 0,
      likesCount: r.likes_count ?? 0,
      category: overrides.category ?? r.category ?? 'single',
      dspLink: r.dsp_link ?? null,
      isCollab: overrides.isCollab ?? (!!r.is_collaboration || detectCollabFromArtist(r.artist)),
    });

    const fetchData = async () => {
      try {
        setLoading(true);

        // Pull releases + their tracks + song details in one go.
        const [{ data: releasesData, error: relErr }, { data: songsData, error: songErr }, { data: profileData }] = await Promise.all([
          (supabase as any)
            .from('releases')
            .select(`id,slug,title,type,primary_artist,cover_path,release_date,sort_order,visibility,
                     release_tracks(track_number,disc_number,hidden,song:songs(${SONG_FIELDS}))`)
            .neq('visibility', 'private')
            .order('sort_order', { ascending: true })
            .order('release_date', { ascending: false, nullsFirst: false })
            .limit(200),
          (supabase as any)
            .from('songs')
            .select(SONG_FIELDS)
            .eq('hidden', false)
            .order('created_at', { ascending: false })
            .limit(300),
          (supabase as any)
            .from('artist_profile')
            .select('default_cover_url')
            .limit(1)
            .maybeSingle(),
        ]);

        if (!cancelled && profileData?.default_cover_url) setDefaultCover(profileData.default_cover_url);
        const fallback = profileData?.default_cover_url || null;
        const resolveCover = (path?: string | null) => {
          if (path) {
            if (path.startsWith('http')) return path;
            if (path.startsWith('/lovable-uploads')) return path;
            return `${SUPABASE_PUBLIC_BASE}/storage/v1/object/public/song-art/${path}`;
          }
          return fallback || 'https://images.unsplash.com/photo-1577985051167-0d49eec21977?w=500';
        };

        if (cancelled) return;
        if (relErr) throw relErr;
        if (songErr) throw songErr;

        const releases: any[] = releasesData ?? [];
        const allSongs: any[] = songsData ?? [];

        const songsOnReleases = new Set<string>();
        const processed: Album[] = [];

        for (const rel of releases) {
          const tracks = (rel.release_tracks ?? [])
            .filter((t: any) => t.song && !t.hidden && !t.song.hidden && t.song.file_path)
            .sort((a: any, b: any) =>
              (a.disc_number ?? 1) - (b.disc_number ?? 1) ||
              (a.track_number ?? 0) - (b.track_number ?? 0)
            );
          if (!tracks.length) continue;

          const firstSong = tracks[0].song;
          const cover = rel.cover_path
            ? getFullImageUrl(rel.cover_path)
            : getFullImageUrl(firstSong?.thumbnail_path);
          const albumTitle = rel.title || 'Untitled';
          const relCategory = (rel.type || 'album').toLowerCase();

          tracks.forEach((t: any) => songsOnReleases.add(t.song.id));

          processed.push({
            id: rel.id,
            slug: rel.slug,
            title: albumTitle,
            artist: rel.primary_artist || firstSong?.artist || 'Unknown Artist',
            coverArt: cover,
            year: rel.release_date ? new Date(rel.release_date).getFullYear().toString() : '',
            type: relCategory,
            songs: tracks.map((t: any) =>
              toSong(t.song, { album: albumTitle, coverArt: cover, category: relCategory })
            ),
          });
        }

        // Orphan songs (not yet attached to any release) — group as a singles pool.
        const orphans = allSongs.filter((s) => s.file_path && !songsOnReleases.has(s.id));
        if (orphans.length) {
          processed.push({
            id: 'singles-pool',
            title: 'Singles',
            artist: 'Various',
            coverArt: getFullImageUrl(orphans[0]?.thumbnail_path),
            year: '',
            type: 'single',
            songs: orphans.map((r) => toSong(r, { category: 'single' })),
          });
        }

        if (!processed.length) {
          toast('No songs available right now', { duration: 2000 });
        }

        if (cancelled) return;
        setAlbums(processed);
        try {
          sessionStorage.setItem(LIBRARY_CACHE_KEY, JSON.stringify({ t: Date.now(), albums: processed }));
        } catch { /* quota */ }
      } catch (e) {
        if (cancelled) return;
        console.error('Error fetching music library:', e);
        setError('Failed to load music library');
        toast.error("Couldn't load your music", { duration: 2000 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [formatDuration, getFullImageUrl]);

  return { albums, loading, error };
};
