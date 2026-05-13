
import { useState, useEffect, useMemo } from 'react';
import { Song } from '../../../data/musicData';

export const useNextSongs = (
  currentSong: Song | null,
  albums: any[],
  playHistory: string[]
) => {
  const [nextSongs, setNextSongs] = useState<Song[]>([]);
  
  // Generate next songs from library
  useEffect(() => {
    if (currentSong && albums.length > 0) {
      // Get all songs from all albums
      const allSongs = albums.flatMap(album => album.songs);
      
      // Filter out current song and recently played songs (from history)
      const availableSongs = allSongs.filter(song => 
        song.id !== currentSong.id && 
        !playHistory.includes(song.id)
      );
      
      // If we have a current album, prioritize its songs
      const currentAlbum = albums.find(a => a.songs.some(s => s.id === currentSong.id));
      
      if (currentAlbum) {
        // Find unplayed songs from the current album
        const albumSongs = currentAlbum.songs
          .filter(s => s.id !== currentSong.id && !playHistory.includes(s.id));
        
        // If we have album songs that haven't been played recently, prioritize them
        if (albumSongs.length > 0) {
          // Combine unplayed album songs first, then other unplayed songs
          const prioritizedSongs = [
            ...albumSongs,
            ...availableSongs.filter(s => !albumSongs.includes(s))
          ];
          setNextSongs(prioritizedSongs);
          
        } else {
          // If all album songs have been played recently, just use other unplayed songs
          setNextSongs(availableSongs);
        }
      } else {
        // Just use all available unplayed songs
        setNextSongs(availableSongs);
      }
      
    }
  }, [currentSong, albums, playHistory]);
  
  return { nextSongs };
};
