import { adminCall, AdminTable } from './api';

export type ReleaseType = 'single' | 'ep' | 'album' | 'compilation' | 'collaboration' | 'mixtape';
export type ReleaseStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type ReleaseVisibility = 'public' | 'unlisted' | 'private';
export type ArtistRole = 'primary' | 'featured' | 'producer' | 'composer' | 'remixer';

export interface Release {
  id: string;
  slug: string;
  title: string;
  type: ReleaseType;
  primary_artist: string;
  cover_path: string | null;
  description: string | null;
  release_date: string | null;
  label: string | null;
  upc: string | null;
  copyright: string | null;
  status: ReleaseStatus;
  visibility: ReleaseVisibility;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ReleaseTrack {
  release_id: string;
  song_id: string;
  track_number: number;
  disc_number: number;
  hidden: boolean;
  songs?: {
    id: string;
    title: string | null;
    artist: string | null;
    duration: number | null;
    thumbnail_path: string | null;
    file_path: string | null;
    play_count: number | null;
    likes_count: number | null;
  };
}

export interface SongArtist {
  id: string;
  song_id: string;
  name: string;
  role: ArtistRole;
  sort_order: number;
}

export interface Genre {
  id: string;
  slug: string;
  name: string;
}

// ---- Generic list/insert/update/delete (typed thin wrappers) ----

export const listTable = <T = any>(table: AdminTable, filter?: Record<string, any>) =>
  adminCall<{ data: T[] }>({ op: 'list', table, ...(filter ? { filter } : {}) } as any).then((r) => r.data);

export const insertRow = <T = any>(table: AdminTable, payload: any) =>
  adminCall<{ data: T }>({ op: 'insert', table, payload }).then((r) => r.data);

export const updateRow = <T = any>(table: AdminTable, id: string, payload: any) =>
  adminCall<{ data: T }>({ op: 'update', table, id, payload }).then((r) => r.data);

export const deleteRow = (table: AdminTable, id: string) =>
  adminCall<{ ok: true }>({ op: 'delete', table, id });

// ---- Composite-PK ops ----

export const listReleaseTracks = (release_id: string) =>
  adminCall<{ data: ReleaseTrack[] }>({ op: 'release_tracks.list' as any, payload: { release_id } } as any).then((r) => r.data);

export const upsertReleaseTracks = (rows: Partial<ReleaseTrack>[]) =>
  adminCall<{ data: ReleaseTrack[] }>({ op: 'release_tracks.upsert' as any, payload: { rows } } as any).then((r) => r.data);

export const removeReleaseTrack = (release_id: string, song_id: string) =>
  adminCall<{ ok: true }>({ op: 'release_tracks.remove' as any, payload: { release_id, song_id } } as any);

export const reorderReleaseTracks = (rows: { release_id: string; song_id: string; track_number: number; disc_number: number }[]) =>
  adminCall<{ ok: true }>({ op: 'release_tracks.reorder' as any, payload: { rows } } as any);

export const listSongArtists = (song_id: string) =>
  adminCall<{ data: SongArtist[] }>({ op: 'song_artists.list' as any, payload: { song_id } } as any).then((r) => r.data);

export const setSongGenres = (song_id: string, genre_ids: string[]) =>
  adminCall<{ ok: true }>({ op: 'song_genres.set' as any, payload: { song_id, genre_ids } } as any);

// ---- Helpers ----

const SUPABASE_PUBLIC_BASE = 'https://iextgszxpxeurbpncapv.supabase.co';

export const coverUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/lovable-uploads')) return path;
  return `${SUPABASE_PUBLIC_BASE}/storage/v1/object/public/song-art/${path}`;
};

export const audioUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${SUPABASE_PUBLIC_BASE}/storage/v1/object/public/song-audio/${path}`;
};

export const RELEASE_TYPES: { value: ReleaseType; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'ep', label: 'EP' },
  { value: 'album', label: 'Album' },
  { value: 'compilation', label: 'Compilation' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'mixtape', label: 'Mixtape' },
];

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
