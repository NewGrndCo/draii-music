
import React from 'react';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Song } from '../../../data/musicData';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FeaturedSongsProps {
  songs: Song[];
}

const FeaturedSongs: React.FC<FeaturedSongsProps> = ({ songs }) => {
  // Filter boosted songs
  const isSongBoosted = (song: Song) => {
    const boostedArtists = ['Arik Divine', 'Yardie', 'Danjha'];
    const boostedSongs = ['Ononon', 'Southside', 'Arty', 'Curbside Shawty'];
    
    const isArtistBoosted = boostedArtists.some(artist => 
      song.artist.toLowerCase().includes(artist.toLowerCase())
    );
    
    const isSongBoosted = boostedSongs.some(songTitle => 
      song.title.toLowerCase().includes(songTitle.toLowerCase())
    );
    
    return isArtistBoosted || isSongBoosted;
  };

  const boostedSongs = songs.filter(isSongBoosted);

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {boostedSongs.map((song) => (
          <Card key={song.id} className="bg-white/5 backdrop-blur-lg p-6">
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{song.title}</h3>
                <p className="text-gray-400 mb-4">{song.artist}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Heart size={16} className="text-purple-400" />
                    <span>{song.likesCount || 0}</span>
                  </div>
                  <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                    Boosted
                  </span>
                </div>
              </div>
              <img 
                src={song.coverArt} 
                alt={song.title} 
                className="w-48 h-48 rounded-xl object-cover"
              />
            </div>
          </Card>
        ))}
        {boostedSongs.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No boosted songs available
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default FeaturedSongs;
