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
import RecentlyPlayed from './RecentlyPlayed';
import ArtistAbout from './ArtistAbout';
import TrendingSongs from './TrendingSongs';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { useLivePresence } from '@/hooks/useLivePresence';

const PlayerContentView: React.FC = () => {
  const {
    currentSong, playerState, playCount, likesCount, liked,
    heartAnimation, horizontalMode, nextSongs, recentSongs,
    formatTime, toggleLike, togglePlayPause,
    toggleRepeat, playNextSong, playPreviousSong, skipForward,
    skipBackward, seekTo, handleVolumeChange, toggleLayout,
    handleSelectSong, openLibrary
  } = usePlayer();

  const { profile } = useArtistProfile();
  const { albums } = useMusicLibrary();
  const allSongs = React.useMemo(() => albums.flatMap((a) => a.songs || []), [albums]);
  // Track this listener as live for the admin dashboard, including now-playing
  useLivePresence(!!currentSong, currentSong ? {
    songId: currentSong.id,
    songTitle: currentSong.title,
    songArtist: currentSong.artist,
    coverArt: currentSong.coverArt,
    isPlaying: playerState?.isPlaying,
  } : undefined);

  if (!currentSong) {
    return <div className="text-foreground text-center p-4">Loading music...</div>;
  }

  const sectionOrder = profile?.frontend_sections?.length
    ? profile.frontend_sections
    : ['trending', 'next_up', 'events', 'merch', 'about'];
  let order = sectionOrder.includes('about') ? sectionOrder : [...sectionOrder, 'about'];
  if (!order.includes('trending')) order = ['trending', ...order];

  const renderSection = (key: string) => {
    switch (key) {
      case 'trending':
        return <TrendingSongs key="trending" songs={allSongs} onSelectSong={handleSelectSong} />;
      case 'next_up':
        return (
          <React.Fragment key="next_up">
            {nextSongs.length > 0 && (
              <NextUpSongs
                nextSongs={nextSongs}
                onSelectSong={handleSelectSong}
                horizontalMode={horizontalMode}
                openLibrary={() => openLibrary(true)}
              />
            )}
            <RecentlyPlayed songs={recentSongs} onSelectSong={handleSelectSong} />
          </React.Fragment>
        );
      case 'events':
        return <UpcomingEvents key="events" />;
      case 'merch':
        return <UpcomingMerch key="merch" />;
      case 'about':
        return <ArtistAbout key="about" />;
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

      <VolumeControl toggleLayout={toggleLayout} />

      {order.map(renderSection)}
    </div>
  );
};

export default React.memo(PlayerContentView);
