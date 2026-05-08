
import React from 'react';

const SongListHeader = () => {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 text-xs text-white/60 font-medium border-b border-white/20 bg-black/30 rounded-lg">
      <div></div>
      <div className="flex items-center gap-1">
        TITLE
      </div>
      <div className="hidden md:flex items-center gap-1">
        ARTIST
      </div>
      <div className="hidden md:flex items-center gap-1">
        PLAYS
      </div>
      <div className="flex items-center gap-1">
        LIKES
      </div>
    </div>
  );
};

export default SongListHeader;
