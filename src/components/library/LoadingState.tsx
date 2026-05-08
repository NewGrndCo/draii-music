
import React from 'react';
import { Loader2, Music } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading music library...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-56">
      <div className="relative">
        <Loader2 className="h-14 w-14 text-cyan-500/70 animate-spin" />
        <Music className="h-6 w-6 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      <p className="text-white/70 mt-5 text-center">
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
