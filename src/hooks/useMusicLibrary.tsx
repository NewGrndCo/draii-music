import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Song, Album } from '../data/musicData';
import { toast } from 'sonner';

const SUPABASE_PUBLIC_BASE = 'https://iextgszxpxeurbpncapv.supabase.co';

const LIBRARY_CACHE_KEY = 'music-library-cache-v4';
const LIBRARY_CACHE_TTL_MS = 5 * 60 * 1000;

export const useMusicLibrary = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFullImageUrl = useCallback((path: string): string => {
    if (!path) return 'https://images.unsplash.com/photo-1577985051167-0d49eec21977?w=500';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/lovable-uploads')) return path;
    return `${SUPABASE_PUBLIC_BASE}/storage/v1/object/public/songs/${path}`;
  }, []);

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

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await (supabase as any)
          .from('songs')
          .select('id,slug,title,artist,duration,file_path,thumbnail_path,play_count,likes_count,category,album_id,hidden,dsp_link,is_collaboration,release_date,created_at')
          .eq('hidden', false)
          .order('created_at', { ascending: false })
          .limit(300);

        if (cancelled) return;
        if (err) throw err;

        const rows: any[] = data ?? [];
        if (!rows.length) {
          toast('No songs available right now', { duration: 2000 });
        }

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
          category: r.category || 'single',
          dspLink: r.dsp_link ?? null,
          isCollab: !!r.is_collaboration || detectCollabFromArtist(r.artist),
        });

        // Album / project parent rows
        const parents = rows.filter((r) => {
          const c = (r.category || '').toLowerCase();
          return c === 'album' || c === 'project';
        });

        const childrenByAlbum = new Map<string, any[]>();
        rows.forEach((r) => {
          if (r.album_id) {
            const arr = childrenByAlbum.get(r.album_id) || [];
            arr.push(r);
            childrenByAlbum.set(r.album_id, arr);
          }
        });

        const processedAlbums: Album[] = [];

        // Real albums/projects from CMS
        parents.forEach((p) => {
          const tracks = childrenByAlbum.get(p.id) || [];
          // Include the parent itself as the title track if it has audio
          const allTracks = p.file_path ? [p, ...tracks] : tracks;
          if (!allTracks.length) return;
          const cover = getFullImageUrl(p.thumbnail_path || tracks[0]?.thumbnail_path);
          processedAlbums.push({
            id: p.id,
            title: p.title || 'Untitled Album',
            artist: p.artist || 'Unknown Artist',
            coverArt: cover,
            year: p.release_date ? new Date(p.release_date).getFullYear().toString() : '',
            songs: allTracks.map((r) => toSong(r, { album: p.title || '', coverArt: cover })),
          });
        });

        // Legacy RUSD synthetic album (covers tracks tagged via thumbnail path)
        const rusdSongs = rows.filter((r) => {
          const t = (r.thumbnail_path || '').toLowerCase();
          return t.includes('rusd') || t.includes('a73e2069-fe62-49c6-b32f-cc97e9d58b49');
        });
        const rusdAlreadyGrouped = rusdSongs.every((r) => r.album_id && parents.some((p) => p.id === r.album_id));
        if (rusdSongs.length && !rusdAlreadyGrouped && !parents.some((p) => (p.title || '').toUpperCase() === 'RUSD')) {
          const cover = '/lovable-uploads/a73e2069-fe62-49c6-b32f-cc97e9d58b49.png';
          processedAlbums.push({
            id: 'rusd-album',
            title: 'RUSD',
            artist: 'Draii Rynell',
            coverArt: cover,
            year: '2023',
            songs: rusdSongs.map((r) => toSong(r, { album: 'RUSD', coverArt: cover })),
          });
        }

        // "All songs" virtual group so the Songs tab has every visible track
        processedAlbums.push({
          id: '__all__',
          title: 'All Songs',
          artist: 'Various',
          coverArt: '',
          year: '',
          songs: rows.map((r) => toSong(r)),
        });

        if (cancelled) return;
        setAlbums(processedAlbums);
        try {
          sessionStorage.setItem(LIBRARY_CACHE_KEY, JSON.stringify({ t: Date.now(), albums: processedAlbums }));
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
