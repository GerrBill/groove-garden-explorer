
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, User, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface UserData {
  id: string;
  email: string;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // List of admin emails that can see this component
  const allowedEmails = ['wjparker@outlook.com', 'ghodgett59@gmail.com'];
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !allowedEmails.includes(user.email || '')) {
        return;
      }
      
      // Fetch users with admin key - this would normally be done via an edge function
      // For now, we're simulating the response for demonstration
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform the response to match our UserData interface
        const formattedUsers = data.users.map(user => ({
          id: user.id,
          email: user.email || 'No email',
          created_at: new Date(user.created_at || '').toLocaleDateString()
        }));
        
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    try {
      // This would normally be handled by an edge function that:
      // 1. Deletes user's playlists
      // 2. Deletes the user from auth.users
      
      console.log(`Deleting user with ID: ${deleteUserId}`);
      
      // First, delete user's playlists
      const { error: playlistError } = await supabase
        .from('playlists')
        .delete()
        .eq('owner', userToDelete?.email || '');
      
      if (playlistError) {
        throw playlistError;
      }
      
      // Delete the user's account
      // Note: In a real implementation, this should be done via an edge function
      // as the client doesn't have permission to delete users
      const { error: authError } = await supabase.auth.admin.deleteUser(deleteUserId);
      
      if (authError) {
        throw authError;
      }
      
      toast({
        title: "User deleted",
        description: `${userToDelete?.email} has been removed successfully.`,
      });
      
      // Refresh user list
      fetchUsers();
      
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteUserId(null);
      setUserToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };
  
  const openDeleteDialog = (user: UserData) => {
    setDeleteUserId(user.id);
    setUserToDelete(user);
    setShowDeleteConfirmation(true);
  };
  
  const { data: { user } } = supabase.auth.getUser();
  const isAdmin = user && allowedEmails.includes(user.email || '');
  
  if (!isAdmin) {
    return (
      <div className="p-4 text-center">
        <p>You don't have permission to access this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">User Management</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fetchUsers()}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center p-4">Loading users...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span className="truncate max-w-[200px]">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.created_at}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(user)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      
      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {userToDelete?.email}'s account and all their playlists.
              <br /><br />
              <strong>Note:</strong> Albums, tracks, images, and blog posts will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirmation(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteUser}
            >
              Yes, delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
