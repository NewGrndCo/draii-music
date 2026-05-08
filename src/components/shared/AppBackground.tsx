
import React, { useState, useEffect, useCallback } from 'react';
import { BackgroundGradientAnimation } from '../ui/background-gradient-animation';
import { Song } from '../../data/musicData';
import { Moon, Sun } from 'lucide-react';

interface AppBackgroundProps {
  currentSong: Song | null;
  children: React.ReactNode;
  showDarkModeToggle?: boolean;
}

const AppBackground: React.FC<AppBackgroundProps> = ({
  currentSong,
  children,
  showDarkModeToggle = false
}) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [gradientColor, setGradientColor] = useState<string>('from-purple-500 via-pink-500 to-rose-500');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Memoized function to extract color to avoid repeated imports
  const extractColor = useCallback(async (coverArt: string) => {
    if (darkMode) return;
    
    try {
      const { extractColorFromImage } = await import('../../data/musicData');
      const color = await extractColorFromImage(coverArt);
      setGradientColor(color);
    } catch (error) {
      console.error("Error extracting color:", error);
      setGradientColor('from-purple-500 via-pink-500 to-rose-500');
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newDarkMode = !prev;
      
      if (newDarkMode) {
        setGradientColor('from-gray-900 via-gray-800 to-gray-900');
      } else if (currentSong?.coverArt) {
        extractColor(currentSong.coverArt);
      }
      
      document.dispatchEvent(new CustomEvent('toggle-dark-mode', { 
        detail: { darkMode: newDarkMode } 
      }));
      
      return newDarkMode;
    });
  };

  // Update background image when current song changes
  useEffect(() => {
    if (currentSong?.coverArt) {
      setBackgroundImage(currentSong.coverArt);
      
      if (!darkMode) {
        extractColor(currentSong.coverArt);
      }
    }
  }, [currentSong, extractColor, darkMode]);

  // Listen for song color change events
  useEffect(() => {
    const handleSongColorChange = (event: CustomEvent) => {
      const { coverArt } = event.detail;
      if (coverArt) {
        setBackgroundImage(coverArt);
        
        if (!darkMode) {
          extractColor(coverArt);
        }
      }
    };
    
    document.addEventListener('song-color-change', handleSongColorChange as EventListener);
    
    return () => {
      document.removeEventListener('song-color-change', handleSongColorChange as EventListener);
    };
  }, [extractColor, darkMode]);

  // Configure gradients based on current song and dark mode
  const getGradientColors = () => {
    if (darkMode) {
      return {
        gradientBackgroundStart: "rgb(10, 10, 20)",
        gradientBackgroundEnd: "rgb(5, 5, 15)",
        firstColor: "30, 30, 40",
        secondColor: "20, 20, 30",
        thirdColor: "40, 40, 60",
      };
    }
    
    if (!currentSong) {
      return {
        gradientBackgroundStart: "rgb(28, 0, 82)",
        gradientBackgroundEnd: "rgb(0, 17, 82)",
        firstColor: "18, 113, 255",
        secondColor: "221, 74, 255",
        thirdColor: "100, 220, 255",
      };
    }

    // Use song-specific colors if available
    if (gradientColor.includes('purple')) {
      return {
        gradientBackgroundStart: "rgb(58, 0, 152)",
        gradientBackgroundEnd: "rgb(0, 17, 82)",
        firstColor: "128, 80, 255",
        secondColor: "221, 74, 255", 
        thirdColor: "140, 180, 255",
      };
    } else if (gradientColor.includes('blue')) {
      return {
        gradientBackgroundStart: "rgb(0, 24, 122)",
        gradientBackgroundEnd: "rgb(0, 17, 82)",
        firstColor: "18, 113, 255",
        secondColor: "41, 121, 255",
        thirdColor: "100, 220, 255",
      };
    } else if (gradientColor.includes('pink') || gradientColor.includes('rose')) {
      return {
        gradientBackgroundStart: "rgb(122, 0, 72)",
        gradientBackgroundEnd: "rgb(82, 0, 41)",
        firstColor: "255, 113, 206",
        secondColor: "255, 74, 158",
        thirdColor: "255, 180, 222",
      };
    } else if (gradientColor.includes('green')) {
      return {
        gradientBackgroundStart: "rgb(0, 82, 42)",
        gradientBackgroundEnd: "rgb(0, 62, 32)",
        firstColor: "40, 200, 120",
        secondColor: "70, 210, 110",
        thirdColor: "100, 255, 150",
      };
    } else if (gradientColor.includes('amber') || gradientColor.includes('yellow') || gradientColor.includes('orange')) {
      return {
        gradientBackgroundStart: "rgb(122, 72, 0)",
        gradientBackgroundEnd: "rgb(82, 41, 0)",
        firstColor: "255, 190, 33",
        secondColor: "255, 160, 74",
        thirdColor: "255, 220, 100",
      };
    } else {
      return {
        gradientBackgroundStart: "rgb(28, 0, 82)",
        gradientBackgroundEnd: "rgb(0, 17, 82)",
        firstColor: "18, 113, 255",
        secondColor: "221, 74, 255",
        thirdColor: "100, 220, 255",
      };
    }
  };

  const gradientColors = getGradientColors();

  return (
    <div className="min-h-screen w-full bg-black overflow-hidden">
      <BackgroundGradientAnimation 
        gradientBackgroundStart={gradientColors.gradientBackgroundStart}
        gradientBackgroundEnd={gradientColors.gradientBackgroundEnd}
        firstColor={gradientColors.firstColor}
        secondColor={gradientColors.secondColor}
        thirdColor={gradientColors.thirdColor}
        blendingValue="soft-light"
        className="fixed top-0 left-0 w-full h-full z-0"
        containerClassName="fixed top-0 left-0 w-full h-full"
      >
        {backgroundImage && !darkMode && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20 scale-110 bg-fixed"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-black"></div>
            </div>
          </div>
        )}
      </BackgroundGradientAnimation>
      
      {showDarkModeToggle && (
        <button 
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/50 transition-colors"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}
      
      {children}
    </div>
  );
};

export default AppBackground;
