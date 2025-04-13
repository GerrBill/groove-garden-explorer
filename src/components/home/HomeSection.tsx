
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
  showAllLink = false, // We'll keep this prop to avoid breaking existing code
  actionButton 
}) => {
  return (
    <section className="mb-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-3">
          {actionButton}
          {/* Show All link removed */}
        </div>
      </div>
      {children}
    </section>
  );
};

export default HomeSection;
