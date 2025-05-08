
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
            variant="ghost" 
            className="rounded-full w-auto p-0 h-auto hover:bg-transparent"
          >
            <User size={18} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
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
        variant="ghost" 
        className="rounded-full w-auto p-0 h-auto hover:bg-transparent"
        onClick={() => setShowAuthDialog(true)}
      >
        <User size={18} />
      </Button>
      
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
      />
    </>
  );
};

export default AccountButton;
