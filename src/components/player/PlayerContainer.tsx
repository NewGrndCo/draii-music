import React from 'react';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import { commitSessionEarnings } from '../../utils/earningsUtil';
import PlayerCore from './PlayerCore';
import DialogsContainer from './DialogsContainerRefactored';
import SharedSongHandler from './SharedSongHandler';

const PlayerContainer: React.FC = () => {
  usePageVisibility({
    onVisibilityChange: (isVisible) => {
      if (!isVisible) commitSessionEarnings();
    }
  });

  return (
    <>
      <SharedSongHandler />
      <PlayerCore />
      <DialogsContainer />
    </>
  );
};

export default React.memo(PlayerContainer);
