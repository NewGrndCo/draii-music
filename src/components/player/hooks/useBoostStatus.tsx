
import { useState, useEffect } from 'react';
import { Song } from '../../../data/musicData';

export const useBoostStatus = (currentSong: Song | null) => {
  const [isBoosted, setIsBoosted] = useState(false);

  useEffect(() => {
    if (!currentSong) return;
    
    const boostedArtists = ['Arik Divine', 'Yardie', 'Danjha'];
    const boostedSongs = ['Ononon', 'Southside', 'Arty', 'Curbside Shawty'];
    
    const isArtistBoosted = boostedArtists.some(artist => 
      currentSong.artist.toLowerCase().includes(artist.toLowerCase())
    );
    
    const isSongBoosted = boostedSongs.some(song => 
      currentSong.title.toLowerCase().includes(song.toLowerCase())
    );
    
    setIsBoosted(isArtistBoosted || isSongBoosted);
  }, [currentSong]);

  return isBoosted;
};
