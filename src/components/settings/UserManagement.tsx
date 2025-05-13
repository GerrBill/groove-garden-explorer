
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/spinner';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_login?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // List of admin emails that can see this component
  const allowedEmails = ['wjparker@outlook.com', 'ghodgett59@gmail.com'];
  
  // Get authenticated user from AuthContext
  const { user } = useAuth();
  
  useEffect(() => {
    // Check if current user is an admin
    if (user && allowedEmails.includes(user.email || '')) {
      setIsAdmin(true);
      fetchUsers();
    } else {
      setIsAdmin(false);
      setIsLoading(false);
    }
  }, [user]);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      if (!user || !allowedEmails.includes(user.email || '')) {
        setIsLoading(false);
        return;
      }
      
      console.log("Fetching all authenticated users...");
      
      // Use admin endpoints with service role to fetch all users
      // This must be done via a Supabase Edge Function since we can't use service role key in browser
      const { data: authUsers, error: adminError } = await supabase.functions.invoke('get-all-users');
      
      if (adminError) {
        console.error("Admin API error:", adminError);
        throw new Error("Failed to fetch users via admin API");
      }
      
      if (!authUsers || !Array.isArray(authUsers)) {
        console.error("Invalid response format:", authUsers);
        throw new Error("Invalid response format from admin API");
      }
      
      console.log("Auth users found:", authUsers.length);
      
      // Format the date for display
      const formattedUsers = authUsers.map(user => ({
        id: user.id,
        email: user.email,
        created_at: new Date(user.created_at).toLocaleDateString(),
        last_login: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : undefined
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again later.",
        variant: "destructive",
      });
      
      // Set some fallback users
      if (user) {
        setUsers([
          {
            id: user.id,
            email: user.email || 'Current User',
            created_at: new Date().toLocaleDateString()
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    try {
      console.log(`Deleting user with ID: ${deleteUserId}`);
      
      // Delete the user via Edge Function which has service role access
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: deleteUserId }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data || !data.success) {
        throw new Error(data?.message || "Failed to delete user");
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
        <div className="text-center p-8">
          <Spinner className="mx-auto" />
          <p className="mt-2">Loading users...</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-muted-foreground" />
                      <span className="truncate max-w-[200px]">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.created_at}</TableCell>
                  <TableCell>{user.last_login || 'Never'}</TableCell>
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
                <TableCell colSpan={4} className="text-center py-4">
                  No registered users found. Users who sign up will appear here.
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
