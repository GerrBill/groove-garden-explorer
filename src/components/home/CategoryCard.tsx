
import React from 'react';

interface CategoryCardProps {
  image: string;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  image, 
  title, 
  subtitle,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-36 h-36',
    md: 'w-44 h-44',
    lg: 'w-full h-64',
  };
  
  return (
    <div className={`${sizeClasses[size]} relative overflow-hidden rounded-lg cursor-pointer group`}>
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover brightness-75 group-hover:scale-105 group-hover:brightness-90 transition-all duration-300" 
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="font-bold text-sm md:text-base">{title}</h3>
        {subtitle && <p className="text-xs text-spotify-text-secondary mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default CategoryCard;
