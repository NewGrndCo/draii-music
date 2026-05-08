
import React, { Suspense } from 'react';
import MusicPlayer from '../components/MusicPlayer';
import { Toaster } from '../components/ui/sonner';
import { useAudio } from '../hooks/useAudio';
import { useIsMobile } from '../hooks/use-mobile';
import AppBackground from '../components/shared/AppBackground';
import TermsOfServiceModal from '../components/TermsOfServiceModal';

const Index = () => {
  const { currentSong } = useAudio();
  const isMobile = useIsMobile();
  
  return (
    <AppBackground currentSong={currentSong} showDarkModeToggle={true}>
      <TermsOfServiceModal />
        
      <Suspense fallback={
        <div className="relative z-10 bg-black min-h-screen min-w-full flex items-center justify-center">
          <div className="text-white">Loading music...</div>
        </div>
      }>
        <main className="relative z-10 w-full h-full flex items-center justify-center">
          <div className="w-full max-w-6xl py-6">
            <MusicPlayer />
          </div>
        </main>
      </Suspense>
      
      <Toaster position={isMobile ? "bottom-center" : "bottom-right"} />
    </AppBackground>
  );
};

export default Index;
