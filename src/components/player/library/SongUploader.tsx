
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SongUploader = ({ onUploadComplete }: { onUploadComplete: () => void }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);
      const file = files[0];
      
      // Upload to Supabase Storage
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('songs')
        .upload(`${Date.now()}-${file.name}`, file);

      if (uploadError) throw uploadError;

      // Create song entry in the database
      const { error: dbError } = await (supabase as any)
        .from('songs')
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          artist: 'Unknown Artist',
          file_path: fileData.path,
          status: 'draft',
          visibility: 'private'
        });

      if (dbError) throw dbError;

      toast.success('Song uploaded successfully');
      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload song');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <Input
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id="song-upload"
      />
      <Button
        variant="outline"
        disabled={uploading}
        className="w-full h-32 border-dashed"
        onClick={() => document.getElementById('song-upload')?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8" />
          <span>{uploading ? 'Uploading...' : 'Click to upload audio file'}</span>
          <span className="text-xs text-muted-foreground">MP3, WAV up to 50MB</span>
        </div>
      </Button>
    </div>
  );
};

export default SongUploader;
