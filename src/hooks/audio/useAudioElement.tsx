
import { useCallback, useEffect, useRef } from 'react';
import { Song } from '../../data/musicData';
import { AudioPlayerState } from './useAudioState';
import { toast } from 'sonner';

const LEGACY_PUBLIC_BASE = 'https://iextgszxpxeurbpncapv.supabase.co';

const getAudioSourceCandidates = (audioSrc: string): string[] => {
  if (!audioSrc) return [];
  if (/^https?:\/\//i.test(audioSrc)) return [audioSrc];

  const currentBase = import.meta.env.VITE_SUPABASE_URL;
  const cleanPath = audioSrc.replace(/^\/+/, '');
  const objectPath = cleanPath.replace(/^(song-audio|songs)\//, '');
  const isBucketQualified = cleanPath !== objectPath;

  return Array.from(new Set([
    isBucketQualified && `${currentBase}/storage/v1/object/public/${cleanPath}`,
    `${LEGACY_PUBLIC_BASE}/storage/v1/object/public/songs/${objectPath}`,
    `${currentBase}/storage/v1/object/public/song-audio/${objectPath}`,
    `${currentBase}/storage/v1/object/public/songs/${objectPath}`,
  ].filter(Boolean) as string[]));
};

export const useAudioElement = (
  currentSong: Song | null,
  playerState: AudioPlayerState,
  setPlayerState: (stateFn: (prev: AudioPlayerState) => AudioPlayerState) => void,
  eventHandlers: any
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userInteractedRef = useRef<boolean>(false);
  const currentSongRef = useRef<Song | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const playRequestIdRef = useRef(0);
  const isPlayingRef = useRef(playerState.isPlaying);
  const audioSourceCandidatesRef = useRef<string[]>([]);
  const audioSourceIndexRef = useRef(0);

  useEffect(() => {
    isPlayingRef.current = playerState.isPlaying;
  }, [playerState.isPlaying]);

  const attemptPlay = useCallback(async (requestId = playRequestIdRef.current) => {
    const audio = audioRef.current;
    if (!audio || !currentSongRef.current || !isPlayingRef.current) return;

    try {
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {});
      }

      const promise = audio.play();
      playPromiseRef.current = promise;
      await promise;

      if (playRequestIdRef.current === requestId) {
        playPromiseRef.current = null;
      }
    } catch (error: any) {
      if (playRequestIdRef.current !== requestId) return;

      playPromiseRef.current = null;

      if (error?.name === 'AbortError') return;

      if (audioSourceIndexRef.current < audioSourceCandidatesRef.current.length - 1) {
        return;
      }

      console.error('Error during audio playback:', error);
      setPlayerState(prev => ({ ...prev, isPlaying: false, isReady: true }));
    }
  }, [setPlayerState]);

  // Create audio element and set up event listeners
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();

      const audio = audioRef.current;
      let stallTimer: number | null = null;
      let stallRetries = 0;

      const clearStallTimer = () => {
        if (stallTimer !== null) {
          window.clearTimeout(stallTimer);
          stallTimer = null;
        }
      };

      const progressHandler = () => {
        eventHandlers.updateProgress(audio);
        // Network is flowing again — reset stall guard
        stallRetries = 0;
        clearStallTimer();
      };
      const durationHandler = () => eventHandlers.updateDuration(audio);

      const stallHandler = () => {
        if (stallTimer !== null || !isPlayingRef.current) return;
        stallTimer = window.setTimeout(() => {
          stallTimer = null;
          if (!isPlayingRef.current || !audio.src) return;
          // Try a soft recovery: reload current src and resume from current position
          if (stallRetries < 2) {
            stallRetries += 1;
            const resumeAt = audio.currentTime;
            try {
              audio.load();
              const onLoaded = () => {
                audio.removeEventListener('loadedmetadata', onLoaded);
                if (resumeAt > 0 && Number.isFinite(resumeAt)) {
                  try { audio.currentTime = resumeAt; } catch {}
                }
                if (isPlayingRef.current) attemptPlay();
              };
              audio.addEventListener('loadedmetadata', onLoaded, { once: true });
            } catch {}
          }
        }, 4000);
      };

      const errorHandler = (event: Event) => {
        clearStallTimer();
        const candidates = audioSourceCandidatesRef.current;
        const nextIndex = audioSourceIndexRef.current + 1;

        if (nextIndex < candidates.length) {
          audioSourceIndexRef.current = nextIndex;
          audio.src = candidates[nextIndex];
          audio.load();
          if (isPlayingRef.current) {
            window.setTimeout(() => attemptPlay(), 0);
          }
          return;
        }

        eventHandlers.handleError(event);
      };

      audio.addEventListener('timeupdate', progressHandler, { passive: true });
      audio.addEventListener('loadedmetadata', durationHandler, { passive: true });
      audio.addEventListener('loadstart', eventHandlers.handleLoadStart, { passive: true });
      audio.addEventListener('canplay', eventHandlers.handleCanPlay, { passive: true });
      audio.addEventListener('canplaythrough', eventHandlers.handleCanPlay, { passive: true });
      audio.addEventListener('ended', eventHandlers.handleSongEnd, { passive: true });
      audio.addEventListener('playing', eventHandlers.handlePlaying, { passive: true });
      audio.addEventListener('stalled', stallHandler, { passive: true });
      audio.addEventListener('waiting', stallHandler, { passive: true });
      audio.addEventListener('error', errorHandler, { passive: true });
      (audio as any).__playerHandlers = { progressHandler, durationHandler, errorHandler, stallHandler };

      const handleUserInteraction = () => {
        userInteractedRef.current = true;
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      };

      document.addEventListener('click', handleUserInteraction, { passive: true });
      document.addEventListener('keydown', handleUserInteraction, { passive: true });
      document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    }
    
    if (audioRef.current) {
      audioRef.current.volume = playerState.volume;
      audioRef.current.loop = playerState.repeat;
    }
    
    return () => {
      if (eventHandlers.loadingTimeoutRef.current) {
        window.clearTimeout(eventHandlers.loadingTimeoutRef.current);
        eventHandlers.loadingTimeoutRef.current = null;
      }
    };
  }, [playerState.repeat, eventHandlers, attemptPlay]);

  // Handle song changes
  useEffect(() => {
    if (audioRef.current && currentSong && currentSong.id !== currentSongRef.current?.id) {
      currentSongRef.current = currentSong;
      
      // Cancel any pending play promise
      if (playPromiseRef.current) {
        playPromiseRef.current = null;
      }
      
      const audioSrc = currentSong.audioSrc;
      if (!audioSrc) {
        console.error('Invalid audio source for song:', currentSong.title);
        if (eventHandlers.hasPlayedSuccessfully.current) {
          toast.error(`Can't play "${currentSong.title}"`, {
            description: 'No audio file available',
            duration: 1500
          });
        }
        setPlayerState(prev => ({ ...prev, isReady: true }));
        return;
      }
      
      const candidates = getAudioSourceCandidates(audioSrc);
      audioSourceCandidatesRef.current = candidates;
      audioSourceIndexRef.current = 0;
      playRequestIdRef.current += 1;

      audioRef.current.src = candidates[0];
      // Streaming strategy:
      //  - Supabase public Storage serves objects via its global CDN
      //    with HTTP Range support, so the browser will stream the file
      //    in partial chunks instead of downloading it whole.
      //  - We start with preload="metadata" so we only fetch the file
      //    header (a few KB) until the user actually plays. When playback
      //    is requested we bump to "auto" to let the browser buffer ahead.
      audioRef.current.preload = isPlayingRef.current ? 'auto' : 'metadata';
      audioRef.current.crossOrigin = 'anonymous';
      audioRef.current.load();
      if (isPlayingRef.current) {
        window.setTimeout(() => attemptPlay(playRequestIdRef.current), 0);
      }
      
      // Update media session metadata
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSong.title,
          artist: currentSong.artist,
          album: currentSong.album,
          artwork: [
            { src: currentSong.coverArt, sizes: '512x512', type: 'image/jpeg' }
          ]
        });
      }
      
      // Dispatch color change event
      const songChangeEvent = new CustomEvent('song-color-change', { 
        detail: { coverArt: currentSong.coverArt }
      });
      document.dispatchEvent(songChangeEvent);
    }
  }, [currentSong, setPlayerState, eventHandlers, attemptPlay]);

  // Handle play state changes separately to avoid race conditions
  useEffect(() => {
    const handlePlayStateChange = async () => {
      if (!audioRef.current || !currentSong) return;
      
      try {
        if (playerState.isPlaying) {
          await attemptPlay(playRequestIdRef.current);
        } else if (!playerState.isPlaying) {
          playRequestIdRef.current += 1;
          if (playPromiseRef.current) {
            await playPromiseRef.current.catch(() => {});
            playPromiseRef.current = null;
          }
          audioRef.current.pause();
        }
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          console.error('Error during audio playback:', error);
          setPlayerState(prev => ({ ...prev, isPlaying: false, isReady: true }));
          playPromiseRef.current = null;
        }
      }
    };

    handlePlayStateChange();
  }, [playerState.isPlaying, currentSong, setPlayerState, attemptPlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        // Cancel any pending play promise
        if (playPromiseRef.current) {
          playPromiseRef.current.catch(() => {});
          playPromiseRef.current = null;
        }
        
        audioRef.current.pause();
        const audio = audioRef.current;
        const handlers = (audio as any).__playerHandlers;
        
        if (handlers) {
          audio.removeEventListener('timeupdate', handlers.progressHandler);
          audio.removeEventListener('loadedmetadata', handlers.durationHandler);
          audio.removeEventListener('error', handlers.errorHandler);
          if (handlers.stallHandler) {
            audio.removeEventListener('stalled', handlers.stallHandler);
            audio.removeEventListener('waiting', handlers.stallHandler);
          }
        }
        audio.removeEventListener('loadstart', eventHandlers.handleLoadStart);
        audio.removeEventListener('canplay', eventHandlers.handleCanPlay);
        audio.removeEventListener('canplaythrough', eventHandlers.handleCanPlay);
        audio.removeEventListener('ended', eventHandlers.handleSongEnd);
        audio.removeEventListener('playing', eventHandlers.handlePlaying);
        audioRef.current = null;
      }
    };
  }, [eventHandlers]);

  return { audioRef };
};
