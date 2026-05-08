
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className="animate-spin text-white/60" size={24} />
      <p className="text-white/70 text-sm">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
