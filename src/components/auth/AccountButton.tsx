
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut, Trash2 } from 'lucide-react';
import AuthDialog from './AuthDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const AccountButton: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const allowedEmails = ['wjparker@outlook.com', 'ghodgett59@gmail.com'];
  const canDeleteUser = user && allowedEmails.includes(user.email || '');

  const handleDeleteUser = async () => {
    try {
      // Here you would implement the actual delete user logic using Supabase
      console.log('Delete user account requested');
      // After deletion, sign out the user
      await signOut();
    } catch (error) {
      console.error('Error deleting user account:', error);
    }
  };

  if (user) {
    return (
      <>
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
            
            {canDeleteUser && (
              <DropdownMenuItem 
                className="cursor-pointer text-red-500 hover:text-red-600"
                onClick={() => setShowDeleteConfirmation(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete User</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Delete User Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDeleteUser}
              >
                Yes, delete my account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
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
