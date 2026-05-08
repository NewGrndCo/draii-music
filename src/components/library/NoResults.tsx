
import React from 'react';
import { SearchX } from 'lucide-react';

interface NoResultsProps {
  searchTerm?: string;
}

const NoResults: React.FC<NoResultsProps> = ({ searchTerm }) => {
  return (
    <div className="flex flex-col items-center justify-center h-56 text-center">
      <SearchX className="h-14 w-14 text-white/30 mb-4" />
      
      <p className="text-white/90 text-lg mb-2">
        No results found
      </p>
      
      {searchTerm && (
        <p className="text-sm text-white/60">
          No matches for "<span className="text-cyan-400">{searchTerm}</span>"
        </p>
      )}
      
      <p className="text-sm text-white/40 mt-3">
        Try a different search term
      </p>
    </div>
  );
};

export default NoResults;
