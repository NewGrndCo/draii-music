
import React, { useState, useCallback, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearch,
  placeholder = "Search songs, artists, albums..."
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Memoize the clear function to prevent unnecessary re-renders
  const handleClear = useCallback(() => {
    setLocalSearchTerm('');
    onSearch('');
  }, [onSearch]);

  // Memoize the search function to prevent unnecessary re-renders
  const handleSearch = useCallback((value: string) => {
    setLocalSearchTerm(value);
    onSearch(value);
  }, [onSearch]);

  // Memoize the input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleSearch(value);
  }, [handleSearch]);

  // Memoize the clear button to prevent unnecessary re-renders
  const clearButton = useMemo(() => {
    if (!localSearchTerm) return null;
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClear}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
      >
        <X size={14} />
      </Button>
    );
  }, [localSearchTerm, handleClear]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
      <Input
        type="text"
        placeholder={placeholder}
        value={localSearchTerm}
        onChange={handleInputChange}
        className="pl-10 pr-10 bg-black/20 border-white/20 text-white placeholder:text-white/60 focus:border-purple-500 focus:ring-purple-500/20"
      />
      {clearButton}
    </div>
  );
};

export default SearchBar;
