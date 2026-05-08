
export interface SongEditData {
  id: string;
  title: string;
  artist: string;
  genre?: string | null;
  play_count?: number;
  likes_count?: number;
  status?: string;
  visibility?: string;
}
