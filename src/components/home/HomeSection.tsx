
import React from 'react';
import { Button } from "@/components/ui/button";

interface HomeSectionProps {
  title: string;
  children: React.ReactNode;
  showAllLink?: boolean;
  actionButton?: React.ReactNode; // Prop for action buttons
}

const HomeSection: React.FC<HomeSectionProps> = ({ 
  title, 
  children, 
  showAllLink = false, 
  actionButton 
}) => {
  return (
    <section className="mb-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-3">
          {actionButton}
          {showAllLink && (
            <Button variant="ghost" size="sm" className="text-sm font-bold text-spotify-text-secondary hover:text-white">
              Show all
            </Button>
          )}
        </div>
      </div>
      {children}
    </section>
  );
};

export default HomeSection;
