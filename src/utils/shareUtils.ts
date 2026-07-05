import { Song } from '../data/musicData';
import { SITE_URL } from '../lib/siteUrl';

// Reserved top-level path segments that must not be treated as slugs.
const RESERVED_SEGMENTS = new Set(['admin', 'c', '']);

// Generate a shareable link for a song. Prefers slug for short, readable URLs.
export const generateShareLink = (song: Song, _useShortFormat = true): string => {
  if (!song) return '';
  const key = (song as any).slug || song.id;
  return `${SITE_URL}/${encodeURIComponent(key)}`;
};

// Generate a shareable link for an album.
export const generateAlbumShareLink = (key: string): string => {
  return `${SITE_URL}/${encodeURIComponent(key)}`;
};

// Extract shared slug from the URL path (falls back to legacy ?s= / ?a= query params).
export const getSharedSongId = (): string | null => {
  const seg = window.location.pathname.split('/').filter(Boolean)[0];
  if (seg && !RESERVED_SEGMENTS.has(seg)) return decodeURIComponent(seg);
  const q = new URLSearchParams(window.location.search);
  return q.get('s') || q.get('a');
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
    url.searchParams.delete('a');
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
