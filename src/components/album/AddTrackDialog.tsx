
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Music } from 'lucide-react';
import { TrackFormValues } from './schemas/trackFormSchema';
import TrackForm from './components/TrackForm';
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types/supabase';
import { 
  fileToBase64, 
  getApproximateDuration, 
  generateFilePath, 
  storeAudioFile,
  extractTitleFromFilename 
} from '@/utils/fileUpload';

interface AddTrackDialogProps {
  children?: React.ReactNode;
  albumId: string;
  onTrackAdded?: (track: Track) => void;
}

const AddTrackDialog: React.FC<AddTrackDialogProps> = ({ children, albumId, onTrackAdded }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [albumInfo, setAlbumInfo] = useState<{ artist: string } | null>(null);
  const [initialValues, setInitialValues] = useState<TrackFormValues>({
    title: "",
    artist: "",
    genre: "",
    comment: "",
  });

  useEffect(() => {
    // Fetch album info to pre-fill the artist field
    const fetchAlbumInfo = async () => {
      if (albumId) {
        const { data, error } = await supabase
          .from('albums')
          .select('artist')
          .eq('id', albumId)
          .single();
        
        if (!error && data) {
          setAlbumInfo(data);
          setInitialValues(prev => ({
            ...prev,
            artist: data.artist
          }));
        }
      }
    };
    
    fetchAlbumInfo();
  }, [albumId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      
      // Extract title from filename
      const suggestedTitle = extractTitleFromFilename(file.name);
      
      // Update the form with the title from the filename
      setInitialValues(prev => ({
        ...prev,
        title: suggestedTitle
      }));
    }
  };

  const onSubmit = async (data: TrackFormValues) => {
    if (!audioFile) {
      toast({
        title: "Error",
        description: "Please upload an audio file",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a file path for the audio file
      const filePath = generateFilePath(albumId, audioFile.name);
      
      // Convert the audio file to base64 for in-memory storage
      const audioBase64 = await fileToBase64(audioFile);
      
      // Store the audio in memory
      storeAudioFile(filePath, audioBase64);
      
      // Calculate next track number
      const { data: existingTracks, error: fetchError } = await supabase
        .from('tracks')
        .select('track_number')
        .eq('album_id', albumId)
        .order('track_number', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      const nextTrackNumber = existingTracks.length > 0 ? 
        existingTracks[0].track_number + 1 : 1;
      
      // Calculate an approximate duration
      const approximateDuration = getApproximateDuration();
      
      // Insert the track data into Supabase
      const { data: trackData, error } = await supabase
        .from('tracks')
        .insert([
          {
            album_id: albumId,
            title: data.title,
            artist: data.artist,
            duration: approximateDuration,
            plays: 0,
            track_number: nextTrackNumber,
            is_liked: false,
            genre: data.genre || null,
            audio_path: filePath
          }
        ])
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log("Track added successfully:", trackData);
      
      // If onTrackAdded callback exists, call it to update the UI
      if (onTrackAdded && trackData) {
        onTrackAdded(trackData);
      }
      
      // Reset the form and state
      setAudioFile(null);
      setOpen(false);
      
      toast({
        title: "Success",
        description: "Track added successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding track:", error);
      toast({
        title: "Error",
        description: "Failed to add track. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700" size="sm">
            <Music size={16} />
            Add Tracks
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-xl max-h-[80vh] overflow-y-auto py-4">
        <DialogHeader className="py-1">
          <DialogTitle className="text-base">Add New Track</DialogTitle>
          <DialogDescription className="text-xs">
            Upload an audio file and fill in the track details below.
          </DialogDescription>
        </DialogHeader>
        
        <TrackForm
          initialValues={initialValues}
          audioFile={audioFile}
          isSubmitting={isSubmitting}
          handleFileChange={handleFileChange}
          onSubmit={onSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;
