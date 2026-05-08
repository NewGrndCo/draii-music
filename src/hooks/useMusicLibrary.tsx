
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Song, Album, isCollaboration } from '../data/musicData';
import { toast } from 'sonner';

export const useMusicLibrary = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to ensure image URLs are properly formatted
  const getFullImageUrl = useCallback((path: string): string => {
    if (!path) return 'https://images.unsplash.com/photo-1577985051167-0d49eec21977?w=500';
    
    if (path.startsWith('http')) return path;
    if (path.startsWith('/lovable-uploads')) return path;
    
    // Make sure paths with or without "thumbnails/" prefix are handled correctly
    return `https://iextgszxpxeurbpncapv.supabase.co/storage/v1/object/public/songs/${path}`;
  }, []);
  
  // Helper function to format seconds into MM:SS
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
        
        // Fetch songs from Supabase
        const { data: songsData, error: songsError } = await supabase
          .from('songs')
          .select('*');
          
        if (songsError) throw songsError;
        
        if (!songsData || songsData.length === 0) {
          console.warn('No songs found in the database');
          toast('No songs available right now', {
            duration: 2000
          });
        }
        
        // Process data into the format our app expects
        // Group singles by artist
        const artistGroups: Record<string, any[]> = {};
        const rusdSongs: any[] = [];
        
        songsData?.forEach(song => {
          // For collaborations, extract the primary artist
          const artist = song.artist?.split(/&|feat\.|ft\.|with|,/)[0].trim() || 'Unknown Artist';
          
          // Check if this song should be in the RUSD album
          const thumbnailPath = song.thumbnail_path || '';
          if (thumbnailPath.toLowerCase().includes('rusd') || 
              thumbnailPath.includes('a73e2069-fe62-49c6-b32f-cc97e9d58b49')) {
            rusdSongs.push(song);
          } else {
            // Add to regular artist group
            if (!artistGroups[artist]) {
              artistGroups[artist] = [];
            }
            artistGroups[artist].push(song);
          }
        });
        
        const processedAlbums: Album[] = [];
        
        // First, create the RUSD album if we have any matching songs
        if (rusdSongs.length > 0) {
          const rusdAlbum: Album = {
            id: 'rusd-album',
            title: 'RUSD',
            artist: 'Draii Rynell',
            coverArt: '/lovable-uploads/a73e2069-fe62-49c6-b32f-cc97e9d58b49.png',
            year: '2023',
            songs: rusdSongs.map(song => ({
              id: song.id,
              title: song.title || 'Untitled',
              artist: song.artist || 'Draii Rynell',
              album: 'RUSD',
              duration: formatDuration(song.duration || 180),
              coverArt: '/lovable-uploads/a73e2069-fe62-49c6-b32f-cc97e9d58b49.png',
              audioSrc: song.file_path || '',
              // Generate unique random stats for each song
              playCount: Math.floor(Math.random() * 1000) + 50,
              likesCount: Math.floor(Math.random() * 200) + 10
            }))
          };
          
          processedAlbums.push(rusdAlbum);
        }
        
        // Create "Singles" albums for each artist
        Object.entries(artistGroups).forEach(([artist, songs]) => {
          // Get a valid thumbnail path from the first song or use a default
          const firstValidThumb = songs[0]?.thumbnail_path || '';
          const albumCoverPath = getFullImageUrl(firstValidThumb);
          
          const singlesAlbum: Album = {
            id: `singles-${artist}`,
            title: `${artist} Collection`,
            artist: artist,
            coverArt: albumCoverPath,
            year: '2023',
            songs: songs.map(song => ({
              id: song.id,
              title: song.title || 'Untitled',
              artist: song.artist || 'Unknown Artist',
              album: `${artist} Collection`,
              duration: formatDuration(song.duration || 180),
              coverArt: getFullImageUrl(song.thumbnail_path),
              audioSrc: song.file_path || '',
              // Generate unique random stats for each song
              playCount: Math.floor(Math.random() * 1000) + 50,
              likesCount: Math.floor(Math.random() * 200) + 10
            }))
          };
          
          processedAlbums.push(singlesAlbum);
        });
        
        // Add a special "Collaborations" album
        const collabSongs = songsData?.filter(song => 
          song.artist?.toLowerCase().includes('ft') ||
          song.artist?.includes('&') || 
          song.artist?.includes(',') || 
          song.artist?.toLowerCase().includes('feat') || 
          song.artist?.toLowerCase().includes('with')
        );
        
        if (collabSongs && collabSongs.length > 0) {
          processedAlbums.push({
            id: 'collaborations',
            title: 'Collaborations',
            artist: 'Various Artists',
            coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
            year: '2023',
            songs: collabSongs.map(song => ({
              id: song.id,
              title: song.title || 'Untitled',
              artist: song.artist || 'Unknown Artist',
              album: 'Collaborations',
              duration: formatDuration(song.duration || 180),
              coverArt: getFullImageUrl(song.thumbnail_path),
              audioSrc: song.file_path || '',
              // Generate unique random stats for each song
              playCount: Math.floor(Math.random() * 1000) + 50,
              likesCount: Math.floor(Math.random() * 200) + 10
            }))
          });
        }
        
        setAlbums(processedAlbums);
      } catch (err) {
        console.error('Error fetching music library:', err);
        setError('Failed to load music library');
        toast.error('Couldn\'t load your music', {
          duration: 2000
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [formatDuration, getFullImageUrl]);
  
  return { albums, loading, error };
};
