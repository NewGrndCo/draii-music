
import React, { useEffect } from 'react';
import { Song } from '../../data/musicData';
import AudioElement from './AudioElement';
import AutoPlayHandler from './AutoPlayHandler';

interface AudioControllerProps {
  currentSong: Song | null;
  playerState: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    repeat: boolean;
  };
  albums: any[];
  loading: boolean;
  nextSongs: Song[];
  
  // Functions
  playSong: (song: Song) => void;
  togglePlayPause: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  playNextSong: () => void;
  playPreviousSong: () => void;
  setOnEndCallback: (callback: () => void) => void;
}

const AudioController: React.FC<AudioControllerProps> = ({
  currentSong,
  playerState,
  albums,
  loading,
  nextSongs,
  playSong,
  togglePlayPause,
  skipForward,
  skipBackward,
  playNextSong,
  playPreviousSong,
  setOnEndCallback
}) => {
  return (
    <>
      {/* Audio management components (non-visual) */}
      <AudioElement 
        currentSong={currentSong}
        playerState={playerState}
        skipForward={skipForward}
        skipBackward={skipBackward}
        togglePlayPause={togglePlayPause}
        playNextSong={playNextSong}
        playPreviousSong={playPreviousSong}
      />
      
      <AutoPlayHandler 
        albums={albums}
        loading={loading}
        currentSong={currentSong}
        playSong={playSong}
        setOnEndCallback={setOnEndCallback}
        nextSongs={nextSongs}
      />
    </>
  );
};

export default AudioController;
