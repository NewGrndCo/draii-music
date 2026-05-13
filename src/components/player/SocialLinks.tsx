
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
        : "text-center mb-6 p-4"
    )}>
      {/* Glowing effect behind logo */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl animate-pulse-slow",
        inFullscreen
          ? "w-16 h-16 bg-purple-500/10"
          : "w-32 h-32 bg-purple-500/20"
      )}></div>
      
      {/* Logo image instead of text */}
      <div className="flex justify-center mb-2 relative">
        <img 
          src={logoUrl} 
          alt="Artist Logo" 
          className={cn(
            "relative z-10 animate-scale drop-shadow-lg cursor-pointer object-contain",
            inFullscreen ? "h-12" : "h-24"
          )}
          onClick={handleLogoClick}
        />
      </div>
      
      {/* Location with icon */}
      <div className="flex items-center justify-center mb-1">
        <MapPin size={inFullscreen ? 10 : 14} className="text-white/70 mr-1" />
        <span className={cn("text-white/70", inFullscreen ? "text-[10px]" : "text-xs")}>{profile?.location?.trim() || 'Suffolk County, NY'}</span>
      </div>
      
      {/* Bio from artist profile (admin-editable) */}
      <p className={cn("text-white/70 mb-1 italic whitespace-pre-line", inFullscreen ? "text-[8px]" : "text-xs")}>
        {bioText || '[𝐚 𝐦𝐢𝐱] : between 𝒏𝒐𝒔𝒕𝒂𝒍𝒈𝒊𝒄 melodies and αмвιєηт progressions..'}
      </p>

      <p className={cn("text-white/50 mt-1", inFullscreen ? "text-[8px]" : "text-xs")}>
        R&B/Soul/Hip-Hop/Reggae
      </p>

      {!inFullscreen && (
        <div className="flex items-center justify-center mt-3 gap-4 flex-wrap">
          {[
            { url: socials.instagram || 'https://instagram.com/draiirynell', Icon: Instagram },
            { url: socials.twitter   || 'https://x.com/ruseriousdraii',     Icon: Twitter },
            { url: socials.facebook,                                         Icon: Facebook },
            { url: socials.youtube   || 'https://youtube.com/@draiirynell',  Icon: Youtube },
            { url: socials.tiktok,                                           Icon: Music2 },
            { url: socials.spotify,                                          Icon: Music2 },
            { url: socials.apple,                                            Icon: Music2 },
          ].filter(s => s.url && s.url.trim()).map(({ url, Icon }, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors">
              <Icon size={20} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialLinks;
