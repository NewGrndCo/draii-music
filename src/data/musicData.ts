export interface Song {
  id: string;
  slug?: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverArt: string;
  audioSrc: string;
  playCount?: number;
  likesCount?: number;
  genre?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  year: string;
  songs: Song[];
}

// Empty array as we're not using mock songs anymore
export const collaborationSongs: Song[] = [];

// Search function that can be used with any Album and Song arrays
export const searchMusic = (query: string, albums: Album[]): { songs: Song[], albums: Album[] } => {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return { songs: [], albums: [] };
  }
  
  const allSongs = albums.flatMap(album => album.songs);
  
  const songs = allSongs.filter(song => 
    song.title.toLowerCase().includes(normalizedQuery) || 
    song.artist.toLowerCase().includes(normalizedQuery) ||
    song.album.toLowerCase().includes(normalizedQuery)
  );
  
  const filteredAlbums = albums.filter(album => 
    album.title.toLowerCase().includes(normalizedQuery) || 
    album.artist.toLowerCase().includes(normalizedQuery)
  );
  
  return { songs, albums: filteredAlbums };
};

// Helper functions
export const getAllSongs = (albums: Album[]): Song[] => {
  return albums.flatMap(album => album.songs);
};

export const getSongById = (id: string, albums: Album[]): Song | undefined => {
  return getAllSongs(albums).find(song => song.id === id);
};

export const getAlbumById = (id: string, albums: Album[]): Album | undefined => {
  return albums.find(album => album.id === id);
};

// Function to check if a song is a collaboration with Draii Rynell
export const isCollaboration = (song: Song): boolean => {
  // Normalize artist name
  const artistLower = song.artist.toLowerCase();
  
  // Check for "ft", "feat", "featuring", "&", "with", or comma
  const hasCollabMarkers = artistLower.includes(' ft ') || 
                          artistLower.includes(' ft. ') || 
                          artistLower.includes(' feat ') || 
                          artistLower.includes(' feat. ') || 
                          artistLower.includes(' featuring ') || 
                          artistLower.includes(' & ') || 
                          artistLower.includes(', ') || 
                          artistLower.includes(' with ');
  
  // Check if "draii" or "rynell" is in the artist name
  const containsDraii = artistLower.includes('draii') || artistLower.includes('rynell');
  
  // It's a collab if:
  // 1. It has collab markers AND contains "draii" or "rynell" (either as main artist or feature)
  return hasCollabMarkers && containsDraii;
};

// Function to check if an image URL is for the RUSD album cover
export const isRUSDCoverArt = (imageUrl: string): boolean => {
  // Check if it's the specific RUSD cover image
  return imageUrl.includes('a73e2069-fe62-49c6-b32f-cc97e9d58b49.png') || 
         imageUrl.includes('RUSD') || 
         imageUrl.includes('rusd');
};

// Function to extract dominant color from an image URL
export const extractColorFromImage = async (imageUrl: string): Promise<string> => {
  try {
    // In a real implementation, you would use a color extraction library
    // For now, we'll return a default color based on a simple hash of the URL
    const hash = [...imageUrl].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate colors based on hash to ensure the same URL always returns the same color
    const colors = [
      'from-purple-500 via-pink-500 to-rose-500',     // Purple-pink
      'from-blue-500 via-indigo-500 to-purple-500',   // Blue-indigo-purple
      'from-green-500 via-teal-500 to-blue-500',      // Green-teal-blue
      'from-red-500 via-orange-500 to-yellow-500',    // Red-orange-yellow
      'from-pink-500 via-rose-500 to-red-500',        // Pink-rose-red
      'from-indigo-500 via-purple-500 to-pink-500'    // Indigo-purple-pink
    ];
    
    return colors[hash % colors.length];
  } catch (error) {
    console.error('Error extracting color from image:', error);
    return 'from-purple-500 via-pink-500 to-rose-500'; // Default gradient
  }
};
