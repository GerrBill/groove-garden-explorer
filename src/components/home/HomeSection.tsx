
import React from 'react';

interface HomeSectionProps {
  title: string;
  children: React.ReactNode;
  showAllLink?: boolean;
  actionButton?: React.ReactNode; // New prop for action buttons
}

const HomeSection: React.FC<HomeSectionProps> = ({ 
  title, 
  children, 
  showAllLink = false, 
  actionButton 
}) => {
  return (
    <section className="mb-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-3">
          {actionButton}
          {showAllLink && (
            <button className="text-sm font-bold text-spotify-text-secondary hover:text-white">
              Show all
            </button>
          )}
        </div>
      </div>
      {children}
    </section>
  );
};

export default HomeSection;
