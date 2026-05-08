
import React, { useEffect, useCallback } from 'react';
import { Album, Song } from '../../data/musicData';
import { getSharedSongId } from '../../utils/shareUtils';
import { toast } from 'sonner';
import { Info } from 'lucide-react';

interface AutoPlayHandlerProps {
  albums: Album[];
  loading: boolean;
  currentSong: Song | null;
  playSong: (song: Song) => void;
  setOnEndCallback: (callback: () => void) => void;
  nextSongs: Song[];
}

const AutoPlayHandler: React.FC<AutoPlayHandlerProps> = ({
  albums,
  loading,
  currentSong,
  playSong,
  setOnEndCallback,
  nextSongs
}) => {
  
  // Create memoized play next song handler that uses the nextSongs from Next Up
  const handlePlayNextSong = useCallback(() => {
    if (nextSongs.length > 0) {
      // Use the first song from the Next Up list (same as skip next functionality)
      console.log('Auto-playing next song from Next Up list:', nextSongs[0].title);
      playSong(nextSongs[0]);
    } else if (albums.length > 0) {
      // Fallback if Next Up is empty - play random song
      const allSongs = albums.flatMap(album => album.songs);
      
      const availableSongs = allSongs.filter(song => 
        !currentSong || song.id !== currentSong.id
      );
      
      if (availableSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        console.log('Next Up empty, auto-playing random song:', availableSongs[randomIndex].title);
        playSong(availableSongs[randomIndex]);
      }
    }
  }, [nextSongs, playSong, albums, currentSong]);
  
  // Automatically select and play a song from the entire library when component mounts
  useEffect(() => {
    if (!loading && albums.length > 0 && !currentSong) {
      // Get all songs from all albums
      const allSongs = albums.flatMap(album => album.songs);
      
      if (allSongs.length > 0) {
        // Check for shared song first
        const sharedSongId = getSharedSongId();
        if (sharedSongId) {
          const sharedSong = allSongs.find(s => s.id === sharedSongId);
          if (sharedSong) {
            playSong(sharedSong);
            toast.success(`Playing shared song: ${sharedSong.title}`, {
              icon: <Info size={16} />,
            });
            return;
          }
        }
        
        // If no shared song, play random song from all songs
        const randomIndex = Math.floor(Math.random() * allSongs.length);
        const randomSong = allSongs[randomIndex];
        
        // Play the random song
        playSong(randomSong);
        console.log('Auto-playing random song from library:', randomSong.title);
      }
    }
  }, [albums, loading, currentSong, playSong]);
  
  // Set up song end callback to automatically play next song
  useEffect(() => {
    setOnEndCallback(handlePlayNextSong);
  }, [handlePlayNextSong, setOnEndCallback]);
  
  return null; // No visual element, just logic
};

export default React.memo(AutoPlayHandler);
