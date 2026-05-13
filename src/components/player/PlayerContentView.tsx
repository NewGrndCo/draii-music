import React from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import SongInfo from './SongInfo';
import ProgressBar from './ProgressBar';
import PlayerControls from './PlayerControls';
import ActionButtons from './ActionButtons';
import VolumeControl from './VolumeControl';
import NextUpSongs from './NextUpSongs';
import UpcomingEvents from './UpcomingEvents';
import UpcomingMerch from './UpcomingMerch';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useLivePresence } from '@/hooks/useLivePresence';

const PlayerContentView: React.FC = () => {
  const {
    currentSong, playerState, playCount, likesCount, liked,
    heartAnimation, horizontalMode, nextSongs,
    formatTime, toggleLike, togglePlayPause,
    toggleRepeat, playNextSong, playPreviousSong, skipForward,
    skipBackward, seekTo, handleVolumeChange, toggleLayout,
    handleSelectSong, openLibrary
  } = usePlayer();

  const { profile } = useArtistProfile();
  // Track this listener as live for the admin dashboard, including now-playing
  useLivePresence(!!currentSong, currentSong ? {
    songId: currentSong.id,
    songTitle: currentSong.title,
    songArtist: currentSong.artist,
    coverArt: currentSong.coverArt,
  } : undefined);

  if (!currentSong) {
    return <div className="text-foreground text-center p-4">Loading music...</div>;
  }

  const sectionOrder = profile?.frontend_sections?.length
    ? profile.frontend_sections
    : ['next_up', 'events', 'merch'];

  const renderSection = (key: string) => {
    switch (key) {
      case 'next_up':
        return nextSongs.length > 0 ? (
          <NextUpSongs
            key="next_up"
            nextSongs={nextSongs}
            onSelectSong={handleSelectSong}
            horizontalMode={horizontalMode}
            openLibrary={() => openLibrary(true)}
          />
        ) : null;
      case 'events':
        return <UpcomingEvents key="events" />;
      case 'merch':
        return <UpcomingMerch key="merch" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <SongInfo
        currentSong={currentSong}
        playCount={playCount}
        likesCount={likesCount}
        liked={liked}
        heartAnimation={heartAnimation}
        onToggleLike={toggleLike}
        isPlaying={playerState.isPlaying}
        formatTime={formatTime}
        duration={playerState.duration}
      />

      <ActionButtons
        liked={liked}
        heartAnimation={heartAnimation}
        toggleLike={toggleLike}
        playCount={playCount}
        likesCount={likesCount}
      />

      <ProgressBar
        currentTime={playerState.currentTime}
        duration={playerState.duration}
        formatTime={formatTime}
        onChange={seekTo}
      />

      <PlayerControls
        currentSong={currentSong}
        playerState={playerState}
        togglePlayPause={togglePlayPause}
        toggleRepeat={toggleRepeat}
        playNextSong={playNextSong}
        playPreviousSong={playPreviousSong}
        skipForward={skipForward}
        skipBackward={skipBackward}
      />

      <VolumeControl
        volume={playerState.volume}
        onVolumeChange={handleVolumeChange}
        toggleLayout={toggleLayout}
      />

      {sectionOrder.map(renderSection)}
    </div>
  );
};

export default React.memo(PlayerContentView);
