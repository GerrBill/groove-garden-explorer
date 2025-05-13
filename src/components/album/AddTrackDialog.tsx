
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast"; 
import TrackForm from './components/TrackForm';
import { uploadAudioFile, getAudioUrl, generateFilePath } from '@/utils/fileUpload';
import { useQueryClient } from '@tanstack/react-query';

interface AddTrackDialogProps {
  children: React.ReactNode;
  albumId: string;
  albumTitle: string;
  artist: string;
}

interface TrackFormData {
  title: string;
  trackNumber: string;
  duration: string;
  genre?: string;
  audioFile?: File;
}

const AddTrackDialog: React.FC<AddTrackDialogProps> = ({
  children,
  albumId,
  albumTitle,
  artist
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (data: TrackFormData) => {
    if (!data.audioFile) {
      toast({
        title: "Error",
        description: "Please select an audio file",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload the audio file
      const filePath = generateFilePath(albumId, data.audioFile.name);
      await uploadAudioFile(data.audioFile, filePath);
      const audioUrl = getAudioUrl(filePath);

      // Convert trackNumber to a number before inserting
      const trackNumberAsNumber = parseInt(data.trackNumber, 10);
      
      // Add the track to the database
      const { error } = await supabase
        .from('tracks')
        .insert({
          album_id: albumId,
          title: data.title,
          artist: artist,
          duration: data.duration,
          genre: data.genre || null,
          audio_path: audioUrl,
          track_number: trackNumberAsNumber
        });

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['album', albumId] });
      queryClient.invalidateQueries({ queryKey: ['tracks', albumId] });

      toast({
        title: "Success",
        description: "Track added successfully"
      });

      setOpen(false);
    } catch (error) {
      console.error('Error adding track:', error);
      toast({
        title: "Error",
        description: "Failed to add track. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add track to {albumTitle}</DialogTitle>
        </DialogHeader>

        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="lg" className="mb-4" />
            <p className="text-center text-muted-foreground">Uploading track...</p>
          </div>
        ) : (
          <TrackForm onSubmit={handleSubmit} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;
