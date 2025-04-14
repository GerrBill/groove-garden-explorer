
import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  active = false,
  href 
}) => {
  const content = (
    <div className={`flex items-center gap-3 py-2 px-3 text-spotify-text-primary font-medium rounded-md hover:bg-zinc-800 cursor-pointer ${active ? 'bg-zinc-800' : ''}`}>
      <div className="text-orange-700">
        {icon}
      </div>
      <span>{label}</span>
    </div>
  );

  if (href) {
    return (
      <Link to={href}>
        {content}
      </Link>
    );
  }

  return content;
};

export default SidebarItem;
