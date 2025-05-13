
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TrackForm from './components/TrackForm';
import { TrackFormValues } from './schemas/trackFormSchema';
import { supabase } from '@/integrations/supabase/client';
import { uploadAudioFile, getAudioUrl } from '@/utils/fileUpload';
import { Track } from '@/types/supabase';
import { toast } from '@/hooks/use-toast';

interface AddTrackDialogProps {
  albumId: string;
  onTrackAdded?: (track: Track) => void;
}

const AddTrackDialog: React.FC<AddTrackDialogProps> = ({ albumId, onTrackAdded }) => {
  const [open, setOpen] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialValues: TrackFormValues = {
    title: '',
    artist: '',
    genre: '',
    comment: ''
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };
  
  const handleSubmit = async (values: TrackFormValues) => {
    if (!audioFile || !albumId) return;
    
    setIsSubmitting(true);
    
    try {
      // Generate a file path for storage
      const filePath = `${albumId}/${Date.now()}-${audioFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      // Upload the audio file to storage
      await uploadAudioFile(audioFile, filePath);
      
      // Get the public URL for the uploaded file
      const audioUrl = getAudioUrl(filePath);
      
      // Get the next track number
      const { data: tracks } = await supabase
        .from('tracks')
        .select('track_number')
        .eq('album_id', albumId)
        .order('track_number', { ascending: false })
        .limit(1);
      
      const nextTrackNumber = tracks && tracks.length > 0 
        ? (parseInt(tracks[0].track_number) + 1).toString() 
        : '1';
      
      // Insert the track into the database
      const { data, error } = await supabase
        .from('tracks')
        .insert({
          album_id: albumId,
          title: values.title,
          artist: values.artist,
          genre: values.genre || null,
          track_number: nextTrackNumber,
          audio_path: filePath,
          audio_url: audioUrl,
          duration: '0:00', // This would normally be calculated from the audio file
          comment: values.comment || null
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Update album track count
      const { data: album } = await supabase
        .from('albums')
        .select('track_count')
        .eq('id', albumId)
        .single();
      
      if (album) {
        const newTrackCount = (parseInt(album.track_count || '0') + 1).toString();
        
        await supabase
          .from('albums')
          .update({ track_count: newTrackCount })
          .eq('id', albumId);
      }
      
      // Close the dialog and reset state
      setOpen(false);
      setAudioFile(null);
      
      // Call the onTrackAdded callback if provided
      if (onTrackAdded && data) {
        onTrackAdded(data);
      }
      
      toast({
        title: "Success",
        description: "Track added successfully!",
        variant: "default"
      });
      
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
        <Button 
          variant="default"
          size="sm" 
          className="flex items-center gap-1"
          aria-label="Add Track"
        >
          <Plus size={16} /> Add Track
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Track</DialogTitle>
        </DialogHeader>
        
        <TrackForm
          initialValues={initialValues}
          audioFile={audioFile}
          isSubmitting={isSubmitting}
          handleFileChange={handleFileChange}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;
