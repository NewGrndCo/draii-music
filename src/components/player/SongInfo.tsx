
import React from 'react';
import { Song } from '../../data/musicData';
import { Share2 } from 'lucide-react';
import { generateShareLink, copyToClipboard } from '../../utils/shareUtils';
import { toast } from 'sonner';

interface SongInfoProps {
  currentSong: Song | null;
  playCount: number;
  likesCount: number;
  liked: boolean;
  heartAnimation: boolean;
  onToggleLike: () => void;
  isPlaying: boolean;
  formatTime?: (time: number) => string;
  duration?: number;
}
const SongInfo: React.FC<SongInfoProps> = ({
  currentSong,
  playCount,
  likesCount,
  liked,
  heartAnimation,
  onToggleLike,
  isPlaying,
  formatTime,
  duration
}) => {
  const handleShare = async () => {
    if (!currentSong) return;
    try {
      // Generate a shorter share link using just the song ID
      const shareLink = generateShareLink(currentSong, true);
      await copyToClipboard(shareLink);
      toast.success('Link copied!', {
        description: 'Share with friends',
        duration: 2000
      });
    } catch (error) {
      toast.error('Failed to generate link', {
        duration: 2000
      });
    }
  };
  return <div className="text-center relative">
      {currentSong ? <>
          <div className="absolute right-0 top-0 flex items-center">
            <button onClick={handleShare} aria-label="Share song" title="Share song link" className="text-white/60 hover:text-white transition-colors p-1 rounded-full text-base mx-0 px-[29px] py-[91px]">
              <Share2 size={18} />
            </button>
          </div>
          
          <div className="space-y-0.5">
            <h2 className="font-semibold text-white transition-opacity animate-enter mx-0 text-center px-0 text-3xl">
              {currentSong.title}
            </h2>
            <p className="text-white/80 transition-opacity text-lg">
              {currentSong.artist}
            </p>
          </div>
        </> : <h2 className="text-lg font-semibold text-white transition-opacity animate-enter">
          No song selected
        </h2>}
    </div>;
};
export default SongInfo;
