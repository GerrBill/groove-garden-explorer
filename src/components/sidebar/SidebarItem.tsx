
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

interface SidebarItemProps {
  label: string;
  active?: boolean;
  href?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  label, 
  active = false,
  href 
}) => {
  const { colorTheme } = useTheme();
  
  const content = (
    <div className={`flex items-center gap-3 py-2 px-3 text-spotify-text-primary font-medium rounded-md hover:bg-zinc-800 cursor-pointer ${active ? 'bg-zinc-800' : ''}`}>
      <span className="text-theme-color">{label}</span>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="text-theme-color">
        {content}
      </Link>
    );
  }

  return content;
};

export default SidebarItem;
