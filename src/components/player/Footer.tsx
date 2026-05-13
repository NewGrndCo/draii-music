import React from 'react';
import { useArtistProfile } from '@/hooks/useArtistProfile';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { profile } = useArtistProfile();
  const text = profile?.footer_text?.trim() || 'App developed by New Ground Solutions';

  return (
    <div className="w-full text-center pt-6 pb-3 px-4 relative z-10">
      <p className="text-white/40 tracking-wide font-light text-xs">
        {text} <span className="text-white/30">© {currentYear}</span>
      </p>
    </div>
  );
};

export default Footer;
