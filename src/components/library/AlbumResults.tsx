
import React from 'react';
import { Album } from '../../data/musicData';
import AlbumCover from '../AlbumCover';
import { AlbumIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface AlbumResultsProps {
  albums: Album[];
  title: string;
  onViewAlbum: (album: Album) => void;
  gridCols?: string;
}

const AlbumResults: React.FC<AlbumResultsProps> = ({ 
  albums, 
  title,
  onViewAlbum,
  gridCols = "grid-cols-2 sm:grid-cols-3 gap-4"
}) => {
  if (albums.length === 0) return null;
  
  // Check if any of the albums is the RUSD album
  const rusdAlbumIndex = albums.findIndex(album => album.id === 'rusd-album');
  
  // Reorganize the albums to put RUSD first if it exists
  const displayAlbums = [...albums];
  if (rusdAlbumIndex !== -1) {
    const [rusdAlbum] = displayAlbums.splice(rusdAlbumIndex, 1);
    displayAlbums.unshift(rusdAlbum);
  }
  
  return (
    <div className="bg-black/20 border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlbumIcon size={20} className="text-purple-400" />
        <h3 className="text-lg font-medium text-white">{title}</h3>
      </div>
      
      <div className={`grid ${gridCols} gap-6`}>
        {displayAlbums.map((album, index) => (
          <TooltipProvider key={album.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <AlbumCover 
                    album={album} 
                    onClick={() => onViewAlbum(album)}
                    index={index}
                    className={album.id === 'rusd-album' ? 'ring-2 ring-purple-400 shadow-lg shadow-purple-500/30' : 'shadow-lg'}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-black/90 backdrop-blur-md text-white border-white/20">
                <div className="text-center p-1">
                  <p className="font-medium">{album.title}</p>
                  <p className="text-xs opacity-70">{album.artist}</p>
                  <p className="text-xs text-purple-300 mt-1">{album.songs.length} songs</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default AlbumResults;
