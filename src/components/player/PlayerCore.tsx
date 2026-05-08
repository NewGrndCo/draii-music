import React from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import PlayerWrapper from './components/PlayerWrapper';
import PlayerContentView from './PlayerContentView';
import Footer from './Footer';
import AudioController from './AudioController';

const PlayerCore: React.FC = () => {
  const {
    currentSong, loading, horizontalMode, gradientColor,
    lightPosition, playNextSong, playPreviousSong, openLibrary,
    playerState, albums, nextSongs, playSong, togglePlayPause,
    skipForward, skipBackward, setOnEndCallback
  } = usePlayer();

  return (
    <>
      <PlayerWrapper
        currentSong={currentSong}
        loading={loading}
        horizontalMode={horizontalMode}
        gradientColor={gradientColor}
        lightPosition={lightPosition}
        playNextSong={playNextSong}
        playPreviousSong={playPreviousSong}
        openLibrary={openLibrary}
      >
        <PlayerContentView />
        <Footer />
      </PlayerWrapper>

      <AudioController
        currentSong={currentSong}
        playerState={playerState}
        albums={albums}
        loading={loading}
        nextSongs={nextSongs}
        playSong={playSong}
        togglePlayPause={togglePlayPause}
        skipForward={skipForward}
        skipBackward={skipBackward}
        playNextSong={playNextSong}
        playPreviousSong={playPreviousSong}
        setOnEndCallback={setOnEndCallback}
      />
    </>
  );
};

export default React.memo(PlayerCore);
