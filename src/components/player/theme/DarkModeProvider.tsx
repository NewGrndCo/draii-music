
import React, { useState, useEffect, createContext, useContext } from 'react';

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useDarkMode = () => useContext(DarkModeContext);

interface DarkModeProviderProps {
  children: React.ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  
  // Listen for global dark mode changes
  useEffect(() => {
    const handleDarkModeToggle = (e: CustomEvent) => {
      setDarkMode(e.detail.darkMode);
    };
    
    document.addEventListener('toggle-dark-mode', handleDarkModeToggle as EventListener);
    return () => {
      document.removeEventListener('toggle-dark-mode', handleDarkModeToggle as EventListener);
    };
  }, []);
  
  // Toggle dark mode - both locally and globally
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Dispatch event to notify other components
    document.dispatchEvent(new CustomEvent('toggle-dark-mode', { 
      detail: { darkMode: newDarkMode } 
    }));
  };
  
  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export default DarkModeProvider;
