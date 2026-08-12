import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Song } from '../../data/musicData';
import { AudioPlayerState } from './useAudioState';
import { clearSignedUrlCache } from './audioSource';
import { useAudioElement } from './useAudioElement';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

class MockAudio extends EventTarget {
  src = '';
  preload = '';
  volume = 1;
  loop = false;
  currentTime = 0;
  load = vi.fn();
  pause = vi.fn();
  play = vi.fn(() => Promise.resolve());
  removeAttribute = vi.fn((name: string) => {
    if (name === 'src') this.src = '';
  });
}

const song = (id: string, audioSrc: string): Song => ({
  id,
  audioSrc,
  title: `Song ${id}`,
  artist: 'Artist',
  album: 'Album',
  duration: '3:00',
  coverArt: 'https://example.com/cover.jpg',
});

const playerState: AudioPlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  repeat: false,
  isReady: false,
};

const createEventHandlers = () => ({
  updateProgress: vi.fn(),
  updateDuration: vi.fn(),
  handleError: vi.fn(),
  handleLoadStart: vi.fn(),
  handleCanPlay: vi.fn(),
  handleSongEnd: vi.fn(),
  handlePlaying: vi.fn(),
  hasPlayedSuccessfully: { current: false },
  loadingTimeoutRef: { current: null },
});

describe('useAudioElement secure source resolution', () => {
  let audio: MockAudio;

  beforeEach(() => {
    clearSignedUrlCache();
    audio = new MockAudio();
    vi.stubGlobal('Audio', vi.fn(function AudioConstructor() { return audio; }));
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('uses a signed URL returned for a private legacy path', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      signedUrl: 'https://signed.example/song.mp3',
      expiresIn: 3600,
    }), { status: 200 }));

    renderHook(() => useAudioElement(
      song('one', 'album/song.mp3'), playerState, vi.fn(), createEventHandlers(),
    ));

    await waitFor(() => expect(audio.src).toBe('https://signed.example/song.mp3'));
    expect(fetch).toHaveBeenCalledWith(
      'https://iextgszxpxeurbpncapv.supabase.co/functions/v1/public-song-url',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ filePath: 'album/song.mp3' }),
      }),
    );
  });

  it('reuses a signed URL while it is safely within its expiry window', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      signedUrl: 'https://signed.example/cached.mp3',
      expiresIn: 3600,
    }), { status: 200 }));

    const first = renderHook(() => useAudioElement(
      song('one', 'album/cached.mp3'), playerState, vi.fn(), createEventHandlers(),
    ));
    await waitFor(() => expect(audio.src).toBe('https://signed.example/cached.mp3'));
    first.unmount();

    audio = new MockAudio();
    renderHook(() => useAudioElement(
      song('two', 'album/cached.mp3'), playerState, vi.fn(), createEventHandlers(),
    ));
    await waitFor(() => expect(audio.src).toBe('https://signed.example/cached.mp3'));

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('shows a concise error and stops playback when signing fails', async () => {
    const setPlayerState = vi.fn();
    vi.mocked(fetch).mockResolvedValue(new Response('denied', { status: 403 }));

    renderHook(() => useAudioElement(
      song('one', 'private/song.mp3'),
      { ...playerState, isPlaying: true },
      setPlayerState,
      createEventHandlers(),
    ));

    await waitFor(() => expect(setPlayerState).toHaveBeenCalled());
    const update = setPlayerState.mock.calls[0][0];
    expect(update({ ...playerState, isPlaying: true })).toMatchObject({
      isPlaying: false,
      isReady: true,
    });
    expect(audio.src).toBe('');
  });

  it('does not let a stale signing response replace a newer song', async () => {
    let resolveFirst!: (response: Response) => void;
    vi.mocked(fetch)
      .mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        signedUrl: 'https://signed.example/new.mp3', expiresIn: 3600,
      }), { status: 200 }));

    const handlers = createEventHandlers();
    const setPlayerState = vi.fn();
    const { rerender } = renderHook(
      ({ currentSong }) => useAudioElement(currentSong, playerState, setPlayerState, handlers),
      { initialProps: { currentSong: song('old', 'old.mp3') } },
    );

    rerender({ currentSong: song('new', 'new.mp3') });
    await waitFor(() => expect(audio.src).toBe('https://signed.example/new.mp3'));

    await act(async () => {
      resolveFirst(new Response(JSON.stringify({
        signedUrl: 'https://signed.example/old.mp3', expiresIn: 3600,
      }), { status: 200 }));
    });
    expect(audio.src).toBe('https://signed.example/new.mp3');
  });

  it('keeps complete HTTP URLs without requesting a signed URL', async () => {
    renderHook(() => useAudioElement(
      song('one', 'https://cdn.example/song.mp3'), playerState, vi.fn(), createEventHandlers(),
    ));

    await waitFor(() => expect(audio.src).toBe('https://cdn.example/song.mp3'));
    expect(fetch).not.toHaveBeenCalled();
  });
});
