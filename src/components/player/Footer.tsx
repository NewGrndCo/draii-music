
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed bottom-1 w-full text-center z-10 pointer-events-none">
      <p className="text-white/30 tracking-wide font-light pointer-events-auto text-xs">
        App developed by{' '}
        <a

          target="_blank"
          rel="noopener noreferrer"
          className="text-white/50 hover:text-white/80 transition-colors font-medium underline-offset-2 hover:underline" href="http://newgrnd.media/">
          
          New Ground Media 
        </a>{' '}
        © {currentYear}
      </p>
    </div>);

};

export default Footer;