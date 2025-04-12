
import React from 'react';

interface HomeSectionProps {
  title: string;
  children: React.ReactNode;
  showAllLink?: boolean;
}

const HomeSection: React.FC<HomeSectionProps> = ({ title, children, showAllLink = false }) => {
  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showAllLink && (
          <button className="text-sm font-bold text-spotify-text-secondary hover:text-white">
            Show all
          </button>
        )}
      </div>
      {children}
    </section>
  );
};

export default HomeSection;
