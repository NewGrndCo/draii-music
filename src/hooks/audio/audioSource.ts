const LEGACY_FUNCTION_URL =
  'https://iextgszxpxeurbpncapv.supabase.co/functions/v1/public-song-url';
const CACHE_EXPIRY_BUFFER_MS = 60_000;

interface SignedUrlResponse {
  signedUrl?: string;
  expiresIn?: number;
}

interface CachedSignedUrl {
  url: string;
  expiresAt: number;
}

const signedUrlCache = new Map<string, CachedSignedUrl>();

export const isCompleteAudioUrl = (audioSrc: string): boolean =>
  /^https?:\/\//i.test(audioSrc);

export const resolveAudioSource = async (
  audioSrc: string,
  signal?: AbortSignal,
): Promise<string> => {
  if (isCompleteAudioUrl(audioSrc)) return audioSrc;

  const cached = signedUrlCache.get(audioSrc);
  if (cached && cached.expiresAt - CACHE_EXPIRY_BUFFER_MS > Date.now()) {
    return cached.url;
  }

  const response = await fetch(LEGACY_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath: audioSrc }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Song URL request failed (${response.status})`);
  }

  const result = (await response.json()) as SignedUrlResponse;
  if (!result.signedUrl || !result.expiresIn) {
    throw new Error('Song URL response was invalid');
  }

  signedUrlCache.set(audioSrc, {
    url: result.signedUrl,
    expiresAt: Date.now() + result.expiresIn * 1000,
  });

  return result.signedUrl;
};

export const clearSignedUrlCache = () => signedUrlCache.clear();
