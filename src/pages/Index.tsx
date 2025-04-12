
import { useState } from 'react';
import TopNav from '@/components/navigation/TopNav';
import HomeSection from '@/components/home/HomeSection';
import AlbumCard from '@/components/home/AlbumCard';
import CategoryCard from '@/components/home/CategoryCard';
import FeaturedCard from '@/components/home/FeaturedCard';

const Index = () => {
  const [selectedTab, setSelectedTab] = useState('All');

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <TopNav selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <CategoryCard 
            image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
            title="Focus Radio"
            size="lg"
          />
          <div className="grid grid-cols-2 gap-6">
            <CategoryCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Jack Pearson"
              size="md"
            />
            <CategoryCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Tore Down House"
              size="md"
            />
            <CategoryCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Live At North Sea Jazz Festival"
              size="md"
            />
            <CategoryCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Crimes Of Passion"
              size="md"
            />
          </div>
        </div>
        
        <HomeSection title="Picked for you">
          <FeaturedCard 
            image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
            title="Dark Academia Jazz"
            description="In a dim, dusty library, reading your novel, and thinking of that special someone..."
            type="Playlist"
          />
        </HomeSection>
        
        <HomeSection title="It's New Music Friday!" showAllLink>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="New Music Friday"
              artist="New music from Bon Iver, Lana del Rey, Shabooze and more"
            />
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Release Radar"
              artist="Catch all the latest music from artists you follow"
            />
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="New Grass"
              artist="Hear the latest releases from bluegrass and americana artists"
            />
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Fresh Finds"
              artist="The latest underground tracks you need to hear"
            />
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Indie Weekly"
              artist="The best new indie tracks, updated every Friday"
            />
          </div>
        </HomeSection>
        
        <HomeSection title="Recently played" showAllLink>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5">
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Focus Radio"
              artist="Groove"
              size="sm"
            />
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Jack Pearson"
              artist="Live From Earth"
              size="sm"
            />
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Jack Pearson"
              artist="Live At North Sea Jazz Festival"
              size="sm"
            />
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Lukather"
              artist="Winter"
              size="sm"
            />
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Tore Down House"
              artist="Scott Henderson"
              size="sm"
            />
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="Burnette"
              artist="Tones"
              size="sm"
            />
            <AlbumCard 
              image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
              title="The Suburbs"
              artist="Arcade Fire"
              size="sm"
            />
          </div>
        </HomeSection>
      </div>
    </div>
  );
};

export default Index;
