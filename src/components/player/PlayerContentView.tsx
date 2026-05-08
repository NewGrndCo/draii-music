import React from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import SongInfo from './SongInfo';
import ProgressBar from './ProgressBar';
import PlayerControls from './PlayerControls';
import ActionButtons from './ActionButtons';
import VolumeControl from './VolumeControl';
import NextUpSongs from './NextUpSongs';

const PlayerContentView: React.FC = () => {
  const {
    currentSong, playerState, playCount, likesCount, liked,
    heartAnimation, horizontalMode, nextSongs,
    formatTime, toggleLike, togglePlayPause,
    toggleRepeat, playNextSong, playPreviousSong, skipForward,
    skipBackward, seekTo, handleVolumeChange, toggleLayout,
    handleSelectSong, openLibrary
  } = usePlayer();

  if (!currentSong) {
    return <div className="text-foreground text-center p-4">Loading music...</div>;
  }

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

      {nextSongs.length > 0 && (
        <NextUpSongs
          nextSongs={nextSongs}
          onSelectSong={handleSelectSong}
          horizontalMode={horizontalMode}
          openLibrary={() => openLibrary(true)}
        />
      )}
    </div>
  );
};

export default React.memo(PlayerContentView);
