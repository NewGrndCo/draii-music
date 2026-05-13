import { Song } from '../data/musicData';

// Generate a shareable link for a song. Prefers slug for short, readable URLs.
export const generateShareLink = (song: Song, _useShortFormat = true): string => {
  if (!song) return '';
  const host = window.location.origin;
  const key = (song as any).slug || song.id;
  return `${host}?s=${key}`;
};

// Extract shared song slug/id from URL
export const getSharedSongId = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('s');
};

// Handle shared song playback (matches by slug or id)
export const handleSharedSong = (
  sharedKey: string,
  songList: Song[],
  playSongCallback: (song: Song) => void
): void => {
  if (!sharedKey || !songList?.length) return;
  const songToPlay = songList.find(
    (s) => (s as any).slug === sharedKey || s.id === sharedKey
  );
  if (songToPlay) {
    playSongCallback(songToPlay);
    const url = new URL(window.location.href);
    url.searchParams.delete('s');
    window.history.replaceState({}, '', url);
  }
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
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
