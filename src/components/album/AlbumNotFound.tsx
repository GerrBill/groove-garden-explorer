
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AlbumNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-xl text-spotify-text-secondary">Album not found</p>
      <Button 
        className="mt-4"
        variant="default"
        onClick={handleGoBack}
      >
        Go back
      </Button>
    </div>
  );
};

export default AlbumNotFound;
