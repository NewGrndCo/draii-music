
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Song } from '../../../../data/musicData';
import MusicLibraryScroll from '../../MusicLibraryScroll';
import SongUploader from '../../library/SongUploader';
import SongEditor from '../../library/SongEditor';
import PlaylistCreator from '../../library/PlaylistCreator';

interface LibraryContentProps {
  songs: Song[];
  loading: boolean;
  onSelectSong: (song: Song) => void;
}

const LibraryContent: React.FC<LibraryContentProps> = ({ songs, loading, onSelectSong }) => {
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [showPlaylistCreator, setShowPlaylistCreator] = useState(false);
  
  const handleEditSong = (song: Song) => {
    setEditingSong(song);
  };
  
  const handleUploadComplete = () => {
    // Refresh songs list
    window.location.reload();
  };

  const handlePlaylistCreated = () => {
    // Refresh playlists or update state as needed
    console.log('Playlist created, refreshing...');
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-black/30 p-4 border-0">
          <h3 className="text-lg font-medium text-white mb-2">Total Tracks</h3>
          <p className="text-2xl font-bold text-white">{songs.length}</p>
        </Card>
        <Card className="bg-black/30 p-4 border-0">
          <h3 className="text-lg font-medium text-white mb-2">Total Albums</h3>
          <p className="text-2xl font-bold text-white">
            {new Set(songs.map(song => song.album)).size}
          </p>
        </Card>
        <Card className="bg-black/30 p-4 border-0">
          <h3 className="text-lg font-medium text-white mb-2">Most Streamed</h3>
          <p className="text-lg font-medium text-white">
            {songs.length > 0 ? songs.reduce((prev, current) => 
              (prev.playCount > current.playCount) ? prev : current).title : 'No data'}
          </p>
        </Card>
      </div>
      
      <Tabs defaultValue="tracks" className="mb-6">
        <TabsList className="bg-black/40 w-full justify-start">
          <TabsTrigger value="tracks">Tracks</TabsTrigger>
          <TabsTrigger value="upload">Upload Media</TabsTrigger>
          <TabsTrigger value="coverart">Cover Art</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tracks" className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <MusicLibraryScroll 
              songs={songs} 
              onSelectSong={onSelectSong}
              onEditSong={handleEditSong}
              showEditButton
            />
          )}
        </TabsContent>
        
        <TabsContent value="upload" className="mt-4">
          <Card className="bg-black/30 p-6 border-0">
            <h3 className="text-xl font-medium text-white mb-4">Upload New Media</h3>
            <SongUploader onUploadComplete={handleUploadComplete} />
          </Card>
        </TabsContent>

        <TabsContent value="coverart" className="mt-4">
          <div className="grid grid-cols-4 gap-4">
            {songs.slice(0, 8).map(song => (
              <div key={song.id} className="group relative">
                <img 
                  src={song.coverArt} 
                  alt={song.title}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <Button variant="ghost" size="sm" className="text-white">View</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="playlists" className="mt-4">
          <Card className="bg-black/30 p-6 border-0">
            <h3 className="text-xl font-medium text-white mb-4">Create New Playlist</h3>
            <p className="text-gray-300 mb-4">Build albums, EPs, or curated sets by grouping tracks together</p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setShowPlaylistCreator(true)}
            >
              New Playlist
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Song Editor Dialog */}
      <SongEditor
        song={editingSong}
        isOpen={!!editingSong}
        onClose={() => setEditingSong(null)}
        onSave={handleUploadComplete}
      />

      {/* Playlist Creator Dialog */}
      <PlaylistCreator
        isOpen={showPlaylistCreator}
        onClose={() => setShowPlaylistCreator(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />
    </div>
  );
};

export default LibraryContent;
