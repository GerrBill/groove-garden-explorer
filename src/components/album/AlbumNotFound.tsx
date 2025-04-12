
import React from 'react';

interface AlbumNotFoundProps {
  onGoBack: () => void;
}

const AlbumNotFound: React.FC<AlbumNotFoundProps> = ({ onGoBack }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <p className="text-xl text-spotify-text-secondary">Album not found</p>
      <button 
        className="mt-4 px-6 py-2 bg-spotify-accent rounded-full text-black font-medium"
        onClick={onGoBack}
      >
        Go back
      </button>
    </div>
  );
};

export default AlbumNotFound;
