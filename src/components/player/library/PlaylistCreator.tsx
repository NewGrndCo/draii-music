
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface PlaylistCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated: () => void;
}

const PlaylistCreator: React.FC<PlaylistCreatorProps> = ({
  isOpen,
  onClose,
  onPlaylistCreated
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    setIsCreating(true);
    
    try {
      // TODO: Implement actual playlist creation with Supabase
      // For now, just simulate the creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Playlist created successfully!');
      setName('');
      setDescription('');
      onPlaylistCreated();
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1a1a] text-white border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playlist-name">Playlist Name</Label>
            <Input
              id="playlist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter playlist name..."
              className="bg-black/30 border-white/20 text-white placeholder:text-gray-400"
              disabled={isCreating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="playlist-description">Description (Optional)</Label>
            <Textarea
              id="playlist-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your playlist..."
              className="bg-black/30 border-white/20 text-white placeholder:text-gray-400 resize-none"
              rows={3}
              disabled={isCreating}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isCreating}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isCreating ? 'Creating...' : 'Create Playlist'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistCreator;
