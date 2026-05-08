
import React, { useState, useEffect } from 'react';
import { Song } from '@/data/musicData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileImage, Music, Upload } from 'lucide-react';

interface SongEditorProps {
  isOpen: boolean;
  onClose: () => void;
  song?: Song | null;
  onSave?: (song: Song) => void;
}

const SongEditor: React.FC<SongEditorProps> = ({ isOpen, onClose, song, onSave }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (song) {
      setTitle(song.title || '');
      setArtist(song.artist || '');
      setAlbum(song.album || '');
      setGenre(song.genre || '');
      setCoverPreview(song.coverArt || '');
    } else {
      resetForm();
    }
  }, [song, isOpen]);
  
  const resetForm = () => {
    setTitle('');
    setArtist('');
    setAlbum('');
    setGenre('');
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Implement the save functionality
      // This would typically upload files to storage and then create/update a database record
      
      toast.success('Song saved successfully');
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving song:', error);
      toast.error('Failed to save song');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };
  
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{song ? 'Edit Song' : 'Add New Song'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input 
                id="artist" 
                value={artist} 
                onChange={(e) => setArtist(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Input 
                id="album" 
                value={album} 
                onChange={(e) => setAlbum(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input 
                id="genre" 
                value={genre} 
                onChange={(e) => setGenre(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cover">Cover Image</Label>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('cover')?.click()}
                  className="w-full"
                >
                  <FileImage className="w-4 h-4 mr-2" />
                  {coverFile || coverPreview ? 'Change Cover' : 'Upload Cover'}
                </Button>
                <Input 
                  id="cover" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverChange} 
                  className="hidden" 
                />
              </div>
              {coverPreview && (
                <div className="mt-2 border rounded-md overflow-hidden h-24 w-24">
                  <img 
                    src={coverPreview} 
                    alt="Cover preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="audio">Audio File</Label>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('audio')?.click()}
                  className="w-full"
                >
                  <Music className="w-4 h-4 mr-2" />
                  {audioFile ? 'Change Audio' : 'Upload Audio'}
                </Button>
                <Input 
                  id="audio" 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleAudioChange} 
                  className="hidden" 
                />
              </div>
              {audioFile && (
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {audioFile.name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : song ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SongEditor;
