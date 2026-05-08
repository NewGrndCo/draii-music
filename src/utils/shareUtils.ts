
import { Song } from '../data/musicData';

// Generate a shareable link for a song
export const generateShareLink = (song: Song, useShortFormat = true): string => {
  if (!song) return '';
  
  // Get the current host
  const host = window.location.origin;
  
  // For short format links, just use the song ID as a parameter
  if (useShortFormat) {
    return `${host}?s=${song.id}`;
  }
  
  // For regular links, include more information
  const params = new URLSearchParams();
  params.set('s', song.id);
  
  return `${host}?${params.toString()}`;
};

// Extract shared song ID from URL
export const getSharedSongId = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('s');
};

// Handle shared song playback
export const handleSharedSong = (
  sharedSongId: string, 
  songList: Song[], 
  playSongCallback: (song: Song) => void
): void => {
  if (sharedSongId && songList && songList.length > 0) {
    // Find the song in the song list
    const songToPlay = songList.find(song => song.id === sharedSongId);
    
    if (songToPlay) {
      console.log(`Playing shared song: ${songToPlay.title}`);
      
      // Play the shared song
      playSongCallback(songToPlay);
      
      // Remove shared song parameter from URL to avoid replaying on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('s');
      window.history.replaceState({}, '', url);
    }
  }
};

// Copy text to clipboard
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};
