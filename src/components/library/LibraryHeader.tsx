
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '../SearchBar';

interface LibraryHeaderProps {
  onBack: () => void;
  showBackButton?: boolean;
  title?: string;
  searchQuery: string;
  onSearch: (query: string) => void;
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  onBack,
  showBackButton = true,
  title = "Music Library",
  searchQuery,
  onSearch
}) => {
  return (
    <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-white/10 p-4">
      <div className="flex items-center gap-4 mb-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/10 p-2"
          >
            <ArrowLeft size={20} />
          </Button>
        )}
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      
      <SearchBar 
        searchTerm={searchQuery}
        onSearch={onSearch}
        placeholder="Search songs, artists, albums..."
      />
    </div>
  );
};

export default LibraryHeader;
