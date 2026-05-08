import React from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import SongInfo from './SongInfo';
import ProgressBar from './ProgressBar';
import PlayerControls from './PlayerControls';
import ActionButtons from './ActionButtons';
import VolumeControl from './VolumeControl';
import NextUpSongs from './NextUpSongs';
import SupportFund from './supportfund';
import NetworkStats from './NetworkStats';

const PlayerContentView: React.FC = () => {
  const {
    currentSong, playerState, playCount, likesCount, liked,
    heartAnimation, showEarnings, currentEarnings, totalEarnings,
    currentRate, networkUserCount, signalStrength, gradientColor,
    horizontalMode, isBoosted, initialReserve, nextSongs,
    formatTime, toggleLike, toggleEarnings, hideEarnings,
    toggleMiningInfo, openTermsOfService, togglePlayPause,
    toggleRepeat, playNextSong, playPreviousSong, skipForward,
    skipBackward, seekTo, handleVolumeChange, toggleLayout,
    handleSelectSong, openLibrary
  } = usePlayer();

  if (!currentSong) {
    return <div className="text-foreground text-center p-4">Loading music...</div>;
  }

  const getNetworkSignalIcon = () => (
    <NetworkStats signalStrength={signalStrength} networkUserCount={networkUserCount} />
  );

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
        toggleEarnings={toggleEarnings}
        showEarnings={showEarnings}
        playCount={playCount}
        likesCount={likesCount}
        isBoosted={isBoosted}
      />

      {showEarnings && (
        <SupportFund
          showEarnings={showEarnings}
          currentEarnings={currentEarnings}
          totalEarnings={totalEarnings}
          currentRate={currentRate}
          signalStrength={signalStrength}
          networkUserCount={networkUserCount}
          toggleMiningInfo={toggleMiningInfo}
          hideEarnings={hideEarnings}
          openTermsOfService={openTermsOfService}
          getNetworkSignalIcon={getNetworkSignalIcon}
          isPlaying={playerState.isPlaying}
          isBoosted={isBoosted}
          initialReserve={initialReserve}
        />
      )}

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
