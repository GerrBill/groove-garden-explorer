
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut } from 'lucide-react';
import AuthDialog from './AuthDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AccountButton: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-full flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700"
          >
            <User size={16} />
            <span className="max-w-[100px] truncate">{user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button 
        size="sm" 
        variant="outline" 
        className="rounded-full bg-zinc-800 hover:bg-zinc-700"
        onClick={() => setShowAuthDialog(true)}
      >
        <User size={16} className="mr-2" />
        Sign In
      </Button>
      
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </>
  );
};

export default AccountButton;
