
import React, { useState, useEffect } from 'react';
import { Album, Song } from '../data/musicData';

// Import our components
import AlbumResults from './library/AlbumResults';
import SongResults from './library/SongResults';
import AlbumDetail from './library/AlbumDetail';
import LibraryHeader from './library/LibraryHeader';
import NoResults from './library/NoResults';
import LoadingState from './library/LoadingState';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from './ui/scroll-area';
import MusicLibraryScroll from './player/MusicLibraryScroll';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Disc, X, User, Users } from 'lucide-react';

const isCollabSong = (s: Song) => {
  if (s.isCollab) return true;
  const a = (s.artist || '').toLowerCase();
  return a.includes('feat') || a.includes(' ft') || a.includes(' & ') || a.includes(',') || a.includes(' with ');
};
const isSingle = (s: Song) => {
  if (s.category) return s.category.toLowerCase() === 'single';
  return !isCollabSong(s);
};


interface MusicLibraryProps {
  albums: Album[];
  onSelectSong: (song: Song) => void;
  onClose: () => void;
  isVisible: boolean;
  isLoading?: boolean;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const MusicLibrary: React.FC<MusicLibraryProps> = ({
  albums = [],
  onSelectSong,
  onClose,
  isVisible,
  isLoading = false,
  darkMode = false,
  onToggleDarkMode = () => {}
}) => {
  const [searchResults, setSearchResults] = useState<{
    songs: Song[];
    albums: Album[];
  }>({
    songs: [],
    albums: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all-songs");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const isMobile = useIsMobile();
  const isFullscreen = !!document.fullscreenElement;
  // Track if a touch/click started inside content area to prevent accidental closes
  const [touchStartedInside, setTouchStartedInside] = useState(false);

  // Get all songs when albums change - add null check here
  useEffect(() => {
    if (albums && albums.length > 0) {
      const songs = albums.flatMap(album => album.songs || []);
      setAllSongs(songs);
    } else {
      setAllSongs([]);
    }
  }, [albums]);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Force component to re-render when fullscreen changes
      setSelectedAlbum(selectedAlbum);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [selectedAlbum]);

  // Lock page scroll while the library is open — only the song list should scroll.
  useEffect(() => {
    if (!isVisible) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouch = (document.body.style as any).touchAction;
    document.body.style.overflow = 'hidden';
    (document.body.style as any).touchAction = 'none';
    return () => {
      document.body.style.overflow = prevOverflow;
      (document.body.style as any).touchAction = prevTouch;
    };
  }, [isVisible]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const normalizedQuery = query.toLowerCase().trim();
      const filteredAlbums = albums ? albums.filter(album => album.title.toLowerCase().includes(normalizedQuery) || album.artist.toLowerCase().includes(normalizedQuery)) : [];
      const allSongs = albums ? albums.flatMap(album => album.songs || []) : [];
      const filteredSongs = allSongs.filter(song => song.title.toLowerCase().includes(normalizedQuery) || song.artist.toLowerCase().includes(normalizedQuery) || song.album.toLowerCase().includes(normalizedQuery));
      setSearchResults({
        songs: filteredSongs,
        albums: filteredAlbums
      });
      setIsSearching(true);
      setSelectedAlbum(null);
      setActiveTab("search-results");
    } else {
      setIsSearching(false);
      setSearchResults({
        songs: [],
        albums: []
      });
    }
  };

  const viewAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setIsSearching(false);
    setActiveTab("album-detail");
  };

  const goBack = () => {
    if (selectedAlbum) {
      setSelectedAlbum(null);
      setActiveTab("all-songs");
    } else if (isSearching) {
      setIsSearching(false);
      setActiveTab("all-songs");
    } else {
      onClose();
    }
  };

  const handleSelectSong = (song: Song) => {
    onSelectSong(song);
    // Don't close in fullscreen mode
    if (!isFullscreen) {
      onClose();
    }
  };

  // Handle container click/touch to close library
  const handleContainerClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isFullscreen) return; // Don't close in fullscreen mode

    // Only close if the click/touch started and ended outside content
    if (!touchStartedInside) {
      onClose();
    }

    // Reset for next interaction
    setTouchStartedInside(false);
  };

  // Track if touch/click started inside content
  const handleContentTouchStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setTouchStartedInside(true);
  };

  // Prevent propagation to container
  const handleContentClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  if (!isVisible) return null;

  // Determine layout classes based on mode
  const containerClasses = isFullscreen ? "fixed inset-0 z-50 bg-black/98 backdrop-blur-xl overflow-hidden" : "fixed inset-0 z-50 bg-black/98 backdrop-blur-xl overflow-hidden";
  const contentClasses = isFullscreen ? "max-w-screen-xl mx-auto h-full flex flex-col p-6" : "max-w-xl mx-auto h-full flex flex-col p-4 md:p-6";
  const gridCols = isFullscreen ? isMobile ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7" : "grid-cols-2 sm:grid-cols-3";

  return (
    <div className={containerClasses} onClick={handleContainerClick} onTouchEnd={handleContainerClick}>
      <div className={contentClasses} onClick={handleContentClick} onTouchStart={handleContentTouchStart} onTouchEnd={e => e.stopPropagation()}>
        {/* Control buttons in the top-right corner */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-50">
          {/* Close Button */}
          
        </div>
        
        {/* Library Header with Search */}
        <LibraryHeader 
          title={selectedAlbum ? selectedAlbum.title : 'Music Library'} 
          onBack={goBack} 
          searchQuery={searchQuery}
          onSearch={handleSearch} 
          showBackButton={!!selectedAlbum || isSearching} 
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Tabs Navigation - Only show when no album is selected */}
          {!selectedAlbum && (
            <TabsList className="w-full bg-black/40 border border-white/20 mb-4 flex-wrap h-auto">
              <TabsTrigger value="all-songs" className="flex items-center gap-1 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <Music size={16} />
                <span>All Songs</span>
              </TabsTrigger>
              <TabsTrigger value="singles" className="flex items-center gap-1 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <User size={16} />
                <span>Singles</span>
              </TabsTrigger>
              <TabsTrigger value="collabs" className="flex items-center gap-1 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <Users size={16} />
                <span>Collabs</span>
              </TabsTrigger>
              <TabsTrigger value="albums" className="flex items-center gap-1 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                <Disc size={16} />
                <span>Albums</span>
              </TabsTrigger>
              {isSearching && (
                <TabsTrigger value="search-results" className="flex items-center gap-1 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  <span>Search Results</span>
                </TabsTrigger>
              )}
            </TabsList>
          )}
          
          {/* Content Area */}
          {isLoading ? (
            <LoadingState />
          ) : selectedAlbum ? (
            <TabsContent value="album-detail" className="flex-1 overflow-hidden">
              <AlbumDetail album={selectedAlbum} onSelectSong={handleSelectSong} compact={!isFullscreen} />
            </TabsContent>
          ) : (
            <div className="flex-1 overflow-hidden">
              {isSearching ? (
                <TabsContent value="search-results" className="h-full">
                  <div className="space-y-6">
                    {/* Albums Results */}
                    {searchResults.albums.length > 0 && (
                      <AlbumResults albums={searchResults.albums} title="Albums" onViewAlbum={viewAlbum} gridCols={gridCols} />
                    )}
                    
                    {/* Songs Results */}
                    {searchResults.songs.length > 0 ? (
                      <MusicLibraryScroll songs={searchResults.songs} onSelectSong={handleSelectSong} />
                    ) : (
                      <NoResults />
                    )}
                  </div>
                </TabsContent>
              ) : (
                <>
                  {/* All Songs Tab */}
                  <TabsContent value="all-songs" className="h-full">
                    <MusicLibraryScroll songs={allSongs} onSelectSong={handleSelectSong} />
                  </TabsContent>

                  {/* Singles Tab */}
                  <TabsContent value="singles" className="h-full">
                    <MusicLibraryScroll songs={allSongs.filter(s => isSingle(s))} onSelectSong={handleSelectSong} />
                  </TabsContent>

                  {/* Collabs Tab */}
                  <TabsContent value="collabs" className="h-full">
                    <MusicLibraryScroll songs={allSongs.filter(s => isCollabSong(s))} onSelectSong={handleSelectSong} />
                  </TabsContent>

                  {/* Albums Tab */}
                  <TabsContent value="albums">
                    <ScrollArea className="h-[70vh]">
                      <AlbumResults albums={albums || []} title="All Albums" onViewAlbum={viewAlbum} gridCols={gridCols} />
                    </ScrollArea>
                  </TabsContent>
                </>
              )}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default MusicLibrary;
