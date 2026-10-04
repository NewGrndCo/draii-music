
import React, { useState, useEffect, useCallback } from 'react';
import { Instagram, Twitter, Facebook, Youtube, MapPin, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useArtistProfile } from '@/hooks/useArtistProfile';

interface SocialLinksProps {
  inFullscreen?: boolean;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ inFullscreen = false }) => {
  const [logoClickCount, setLogoClickCount] = useState(0);
  const navigate = useNavigate();
  const { profile } = useArtistProfile();
  const socials = profile?.socials ?? {};
  const bioText = profile?.bio?.trim();
  const logoUrl = profile?.logo_url || '/lovable-uploads/5ae7ab3a-8c2b-4cbe-9d1d-322b4912ca63.png';
  
  // Reset click count after timeout
  useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => {
        setLogoClickCount(0);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);
  
  // Memoize the logo click handler to prevent unnecessary re-renders
  const handleLogoClick = useCallback(() => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      
      // If clicked 3 times, navigate to admin page
      if (newCount === 3) {
        // Use setTimeout to avoid state update during render
        setTimeout(() => {
          navigate('/admin');
        }, 0);
        return 0; // Reset count
      }
      
      return newCount;
    });
    
    // Dispatch theme toggle event after state update
    setTimeout(() => {
      const event = new CustomEvent('toggle-simple-theme');
      document.dispatchEvent(event);
    }, 0);
  }, [navigate]);
  
  return (
    <div className={cn(
      "relative",
      inFullscreen 
        ? "text-center w-full mb-4" 
        : "text-center mb-6 px-4"
    )}>
      {/* Glowing effect behind logo */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl animate-pulse-slow pointer-events-none",
        inFullscreen
          ? "w-16 h-16 bg-purple-500/10"
          : "w-32 h-32 bg-purple-500/20"
      )}></div>
      
      {/* Logo image instead of text */}
      <button type="button" onClick={handleLogoClick} aria-label="Toggle player theme" className="flex justify-center mb-3 relative mx-auto rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
        <img 
          src={logoUrl} 
          alt="Draii Rynell"
          className={cn(
            "relative z-10 drop-shadow-lg object-contain",
            inFullscreen ? "h-12" : "h-20 sm:h-24"
          )}
        />
      </button>
      
      {/* Location with icon */}
      <div className="flex items-center justify-center mb-1">
        <MapPin size={inFullscreen ? 10 : 14} className="text-white/70 mr-1" />
        <span className={cn("text-white/70", inFullscreen ? "text-[10px]" : "text-xs")}>{profile?.location?.trim() || 'Suffolk County, NY'}</span>
      </div>
      
      {/* Bio from artist profile (admin-editable) */}
      <p className={cn("text-white/70 mb-1 italic whitespace-pre-line max-w-md mx-auto leading-relaxed", inFullscreen ? "text-xs" : "text-xs sm:text-sm")}>
        {bioText || '[𝐚 𝐦𝐢𝐱] : between 𝒏𝒐𝒔𝒕𝒂𝒍𝒈𝒊𝒄 melodies and αмвιєηт progressions..'}
      </p>

      <p className={cn("text-white/50 mt-1", inFullscreen ? "text-xs" : "text-xs")}>
        R&B/Soul/Hip-Hop/Reggae
      </p>

      {!inFullscreen && (
        <div className="flex items-center justify-center mt-3 gap-4 flex-wrap">
          {[
            { url: socials.instagram || 'https://instagram.com/draiirynell', Icon: Instagram, label: 'Instagram' },
            { url: socials.twitter   || 'https://x.com/ruseriousdraii', Icon: Twitter, label: 'X' },
            { url: socials.facebook, Icon: Facebook, label: 'Facebook' },
            { url: socials.youtube   || 'https://youtube.com/@draiirynell', Icon: Youtube, label: 'YouTube' },
            { url: socials.tiktok, Icon: Music2, label: 'TikTok' },
            { url: socials.spotify, Icon: Music2, label: 'Spotify' },
            { url: socials.apple, Icon: Music2, label: 'Apple Music' },
          ].filter(s => s.url && s.url.trim()).map(({ url, Icon, label }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full text-white/65 hover:text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white transition-colors">
              <Icon size={19} aria-hidden="true" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialLinks;
