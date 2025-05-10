
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hashParams, setHashParams] = useState<URLSearchParams | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string | null>(null);

  // Extract the access token from the URL hash
  useEffect(() => {
    const hash = location.hash.substring(1); // Remove the leading #
    const params = new URLSearchParams(hash);
    setHashParams(params);
    
    // Try to extract email from the token
    const extractEmailFromToken = async () => {
      try {
        const accessToken = params.get('access_token');
        if (accessToken) {
          const { data, error } = await supabase.auth.getUser(accessToken);
          if (!error && data?.user?.email) {
            setEmail(data.user.email);
          }
        }
      } catch (error) {
        console.error('Error extracting email from token:', error);
      }
    };
    
    extractEmailFromToken();
  }, [location.hash]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    // Confirm passwords match
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the access token from the URL hash
      const accessToken = hashParams?.get('access_token');
      
      if (!accessToken) {
        throw new Error('No access token found in URL');
      }
      
      // Fix: Use the correct approach to update user password with the access token
      const { error } = await supabase.auth.updateUser(
        { password: newPassword },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been reset. You can now sign in with your new password.",
      });
      
      // Redirect to homepage and open sign-in dialog with email prefilled
      if (email) {
        navigate('/?email=' + encodeURIComponent(email));
      } else {
        navigate('/');
      }
      
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message || "There was an error resetting your password. Please try again.",
        variant: "destructive",
      });
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If no token is found, show an error
  if (!hashParams?.get('access_token')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center">Invalid Reset Link</h1>
          <p className="text-center text-muted-foreground">
            The password reset link is invalid or has expired. Please request a new password reset link.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Reset Your Password</h1>
        
        {email && (
          <p className="text-sm text-center text-muted-foreground">
            Setting new password for {email}
          </p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/')}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Home
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
