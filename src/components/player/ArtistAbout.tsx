import React from 'react';
import { useArtistProfile } from '@/hooks/useArtistProfile';

const ArtistAbout: React.FC = () => {
  const { profile } = useArtistProfile();
  const bio = profile?.detailed_bio?.trim();
  const img = profile?.artist_image_url;
  if (!bio && !img) return null;

  return (
    <section className="mt-4 rounded-xl bg-white/[0.03] border border-white/10 p-4 backdrop-blur-sm">
      <h3 className="text-white/90 text-sm font-semibold mb-3 tracking-wide">About the Artist</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        {img && (
          <img
            src={img}
            alt="Artist"
            loading="lazy"
            className="w-full sm:w-32 h-40 sm:h-32 object-cover rounded-lg border border-white/10 flex-shrink-0"
          />
        )}
        {bio && (
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed whitespace-pre-line flex-1">
            {bio}
          </p>
        )}
      </div>
    </section>
  );
};

export default React.memo(ArtistAbout);
