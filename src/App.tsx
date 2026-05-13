
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { useAudio } from './hooks/useAudio';
import { useIsMobile } from './hooks/use-mobile';
import { AnimationProvider } from './hooks/useAnimationContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import AppBackground from './components/shared/AppBackground';
import MusicPlayer from './components/MusicPlayer';
import MailingListModal from './components/MailingListModal';
import AdminGuard from './components/AdminGuard';

const Admin = lazy(() => import('./pages/Admin'));

const App = () => {
  const { currentSong } = useAudio();
  const isMobile = useIsMobile();

  return (
    <ErrorBoundary>
      <AnimationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
            <Route path="/" element={
              <AppBackground currentSong={currentSong}>
                <MailingListModal />
                
                <Suspense fallback={
                  <div className="relative z-10 bg-black min-h-screen min-w-full flex items-center justify-center">
                    <div className="text-white">Loading...</div>
                  </div>
                }>
                  <main className="relative z-10 w-full h-full flex items-center justify-center">
                    <div className="w-full max-w-6xl py-0 px-0 my-0">
                      <MusicPlayer />
                    </div>
                  </main>
                </Suspense>
                
                <Toaster position={isMobile ? "bottom-center" : "bottom-right"} />
              </AppBackground>
            } />
          </Routes>
        </BrowserRouter>
      </AnimationProvider>
    </ErrorBoundary>
  );
};

export default App;
