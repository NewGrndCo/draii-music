import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Song, Album } from '../data/musicData';
import { toast } from 'sonner';

// Deterministic hash → integer for stable per-song counts
const hashString = (input: string): number => {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
};

const stablePlayCount = (id: string) => 50 + (hashString(`plays:${id}`) % 1000);
const stableLikesCount = (id: string) => 10 + (hashString(`likes:${id}`) % 200);

// Audio + thumbnail files live in the legacy storage bucket
const SUPABASE_PUBLIC_BASE = 'https://iextgszxpxeurbpncapv.supabase.co';

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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Egress optimization: select only the columns the player actually uses,
        // and cap the row count to stay well under Supabase free-tier limits.
        const { data: songsData, error: songsError } = await (supabase as any)
          .from('songs')
          .select('id,slug,title,artist,duration,file_path,thumbnail_path,play_count,likes_count,category,album_id')
          .order('created_at', { ascending: false })
          .limit(500);

        if (songsError) throw songsError;

        if (!songsData || songsData.length === 0) {
          console.warn('No songs found in the database');
          toast('No songs available right now', { duration: 2000 });
        }

        const artistGroups: Record<string, any[]> = {};
        const rusdSongs: any[] = [];

        (songsData ?? []).forEach((song: any) => {
          const artist = song.artist?.split(/&|feat\.|ft\.|with|,/)[0].trim() || 'Unknown Artist';
          const thumbnailPath = song.thumbnail_path || '';
          if (
            thumbnailPath.toLowerCase().includes('rusd') ||
            thumbnailPath.includes('a73e2069-fe62-49c6-b32f-cc97e9d58b49')
          ) {
            rusdSongs.push(song);
          } else {
            if (!artistGroups[artist]) artistGroups[artist] = [];
            artistGroups[artist].push(song);
          }
        });

        const processedAlbums: Album[] = [];

        if (rusdSongs.length > 0) {
          processedAlbums.push({
            id: 'rusd-album',
            title: 'RUSD',
            artist: 'Draii Rynell',
            coverArt: '/lovable-uploads/a73e2069-fe62-49c6-b32f-cc97e9d58b49.png',
            year: '2023',
            songs: rusdSongs.map((song: any) => ({
              id: song.id,
              slug: song.slug,
              title: song.title || 'Untitled',
              artist: song.artist || 'Draii Rynell',
              album: 'RUSD',
              duration: formatDuration(song.duration || 180),
              coverArt: '/lovable-uploads/a73e2069-fe62-49c6-b32f-cc97e9d58b49.png',
              audioSrc: song.file_path || '',
              playCount: song.play_count ?? 0,
              likesCount: song.likes_count ?? 0,
            })),
          });
        }

        Object.entries(artistGroups).forEach(([artist, songs]) => {
          const firstValidThumb = songs[0]?.thumbnail_path || '';
          const albumCoverPath = getFullImageUrl(firstValidThumb);

          processedAlbums.push({
            id: `singles-${artist}`,
            title: `${artist} Collection`,
            artist,
            coverArt: albumCoverPath,
            year: '2023',
            songs: songs.map((song: any) => ({
              id: song.id,
              slug: song.slug,
              title: song.title || 'Untitled',
              artist: song.artist || 'Unknown Artist',
              album: `${artist} Collection`,
              duration: formatDuration(song.duration || 180),
              coverArt: getFullImageUrl(song.thumbnail_path),
              audioSrc: song.file_path || '',
              playCount: song.play_count ?? 0,
              likesCount: song.likes_count ?? 0,
            })),
          });
        });

        const collabSongs = (songsData ?? []).filter((song: any) =>
          song.artist?.toLowerCase().includes('ft') ||
          song.artist?.includes('&') ||
          song.artist?.includes(',') ||
          song.artist?.toLowerCase().includes('feat') ||
          song.artist?.toLowerCase().includes('with')
        );

        if (collabSongs.length > 0) {
          processedAlbums.push({
            id: 'collaborations',
            title: 'Collaborations',
            artist: 'Various Artists',
            coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
            year: '2023',
            songs: collabSongs.map((song: any) => ({
              id: song.id,
              slug: song.slug,
              title: song.title || 'Untitled',
              artist: song.artist || 'Unknown Artist',
              album: 'Collaborations',
              duration: formatDuration(song.duration || 180),
              coverArt: getFullImageUrl(song.thumbnail_path),
              audioSrc: song.file_path || '',
              playCount: song.play_count ?? 0,
              likesCount: song.likes_count ?? 0,
            })),
          });
        }

        setAlbums(processedAlbums);
      } catch (err) {
        console.error('Error fetching music library:', err);
        setError('Failed to load music library');
        toast.error("Couldn't load your music", { duration: 2000 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formatDuration, getFullImageUrl]);

  return { albums, loading, error };
};
