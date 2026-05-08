import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="fixed bottom-1 w-full text-center z-10 pointer-events-none">
      <p className="text-white/30 tracking-wide font-light pointer-events-auto text-xs">
        App developed by{' '}
        <span className="text-white/50 font-medium">New Ground Solutions</span>{' '}
        © {currentYear}
      </p>
    </div>
  );
};

export default Footer;
