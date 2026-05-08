import React from 'react';
import PlayerCore from './PlayerCore';
import DialogsContainer from './DialogsContainerRefactored';
import SharedSongHandler from './SharedSongHandler';

const PlayerContainer: React.FC = () => {
  return (
    <>
      <SharedSongHandler />
      <PlayerCore />
      <DialogsContainer />
    </>
  );
};

export default React.memo(PlayerContainer);
