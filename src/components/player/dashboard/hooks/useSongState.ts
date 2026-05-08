
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Song } from '@/data/musicData';
import { toast } from 'sonner';

export function useSongState(isOpen: boolean) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // The fetchSongs function is wrapped in useCallback to avoid unnecessary re-renders
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: songsData, error } = await (supabase as any)
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedSongs: Song[] = (songsData ?? []).map((song: any) => ({
        id: song.id,
        title: song.title || 'Untitled',
        artist: song.artist || 'Unknown Artist',
        album: song.category || 'Single',
        duration: formatDuration(song.duration || 180),
        coverArt: formatImageUrl(song.thumbnail_path),
        audioSrc: song.file_path || '',
        playCount: song.play_count || Math.floor(Math.random() * 1000) + 50,
        likesCount: Math.floor(Math.random() * 200) + 10,
        genre: song.genre || null
      }));
      
      setSongs(formattedSongs);
    } catch (error: any) {
      console.error('Error fetching songs:', error);
      setError(error.message || 'Failed to load songs');
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  }, []); // Removed 'loading' dependency to prevent infinite loop

  // Only fetch songs when the component is opened
  useEffect(() => {
    if (isOpen) {
      fetchSongs();
    }
  }, [isOpen, fetchSongs]);

  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatImageUrl = (path: string | null): string => {
    if (!path) return 'https://images.unsplash.com/photo-1577985051167-0d49eec21977?w=500';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/lovable-uploads')) return path;
    return `https://iextgszxpxeurbpncapv.supabase.co/storage/v1/object/public/songs/${path}`;
  };

  const handleSelectSong = (song: Song) => {
    console.log('Selected song:', song);
  };

  const refreshSongs = () => {
    fetchSongs();
  };

  return {
    songs,
    loading,
    error,
    handleSelectSong,
    refreshSongs
  };
}
