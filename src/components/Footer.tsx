
import React from 'react';
import { Github, Twitter, Heart, Share2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-transparent text-sm text-white/50 animate-fade-in border-t border-white/10">
      <div className="container mx-auto px-4 flex flex-col items-center py-3">
        <div className="flex items-center space-x-4 mb-2">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="GitHub">
            <Github size={16} />  
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">
            <Twitter size={16} />
          </a>
          <button className="hover:text-white transition-colors" aria-label="Share" onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Amazing Music Player',
                text: 'Check out this awesome music player!',
                url: window.location.href
              });
            }
          }}>
            <Share2 size={16} />
          </button>
        </div>
        
        {/* Attribution with NewGRND link */}
        <div className="text-xs flex flex-col items-center space-y-1">
          <div className="flex items-center">
            <span>Made with</span>
            <Heart size={12} className="mx-1 text-red-400" />
            <span>© {new Date().getFullYear()} Music Player</span>
          </div>
          
          <p className="flex items-center justify-center text-xs text-white/50 font-sans">
            App developed by <a 
              href="" 
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "ml-1 flex items-center text-white/60 hover:text-white/80 transition-colors"
              )}
            >
              New Ground Solutions <ExternalLink size={10} className="ml-1" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
