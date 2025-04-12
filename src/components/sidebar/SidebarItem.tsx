
import React from 'react';

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-3 py-2 px-3 text-spotify-text-primary font-medium rounded-md hover:bg-zinc-800 cursor-pointer">
      <div className="text-spotify-text-secondary">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
};

export default SidebarItem;
