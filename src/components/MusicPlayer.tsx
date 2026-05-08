import React from 'react';
import { PlayerProvider } from '../contexts/PlayerContext';
import PlayerContainer from './player/PlayerContainer';
import CoverArtAnimation from './player/CoverArtAnimation';

const MusicPlayer: React.FC = () => {
  return (
    <PlayerProvider>
      <PlayerContainer />
      <CoverArtAnimation />
    </PlayerProvider>
  );
};

export default React.memo(MusicPlayer);
