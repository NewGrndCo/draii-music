import React, { useState, useEffect } from 'react';
import { Music2 } from 'lucide-react';

interface Props {
  src?: string | null;
  fallback?: string | null;
  alt?: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Cover image with graceful fallback. If `src` fails to load (404, missing
 * storage object, etc.), it swaps to `fallback`. If that also fails (or both
 * are empty), it renders a clean music icon — never the browser's broken-file
 * icon.
 */
const SmartCover: React.FC<Props> = ({ src, fallback, alt = '', className = '', iconClassName = '' }) => {
  const [errored, setErrored] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => { setErrored(false); setUsingFallback(false); }, [src, fallback]);

  const primary = src || fallback || null;
  if (!primary || errored) {
    return (
      <div className={`flex items-center justify-center bg-white/[0.04] ${className}`}>
        <Music2 className={`text-white/30 ${iconClassName || 'h-1/3 w-1/3'}`} />
      </div>
    );
  }

  const effective = usingFallback && fallback ? fallback : primary;

  return (
    <img
      src={effective}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => {
        if (!usingFallback && fallback && fallback !== primary) {
          setUsingFallback(true);
        } else {
          setErrored(true);
        }
      }}
    />
  );
};

export default SmartCover;
