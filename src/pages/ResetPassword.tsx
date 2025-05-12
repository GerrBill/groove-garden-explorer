
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingHash, setIsProcessingHash] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract parameters from the URL hash
  useEffect(() => {
    const processHash = async () => {
      setIsProcessingHash(true);
      
      try {
        // Remove the leading # and parse the hash
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        // Check for error in the hash
        const errorParam = params.get('error');
        const errorCode = params.get('error_code');
        const errorDescription = params.get('error_description');
        
        if (errorParam || errorCode) {
          const errorMessage = errorDescription?.replace(/\+/g, ' ') || 
                              errorParam || 
                              'Invalid or expired reset link';
          setError(errorMessage);
          
          // Clear the hash to prevent repeated login attempts
          window.history.replaceState(null, document.title, window.location.pathname);
          setIsProcessingHash(false);
          return;
        }
        
        // If we have an access_token, try to extract the email and set up for password reset
        const token = params.get('access_token');
        if (token) {
          setAccessToken(token);
          
          // Get user data using the access token
          const { data, error } = await supabase.auth.getUser(token);
          if (error) {
            console.error('Error getting user with token:', error);
            throw error;
          }
          
          if (data?.user?.email) {
            setEmail(data.user.email);
            // Show the reset password dialog automatically
            setShowDialog(true);
          } else {
            throw new Error('Could not retrieve email from user data');
          }
          
          // Clear the hash to prevent repeated login attempts
          window.history.replaceState(null, document.title, window.location.pathname);
        } else {
          setError('No access token found in URL. This reset link may be invalid or incomplete.');
        }
      } catch (err: any) {
        console.error('Error processing hash parameters:', err);
        setError(err.message || 'An error occurred while processing the reset link');
      } finally {
        setIsProcessingHash(false);
      }
    };
    
    if (location.hash) {
      processHash();
    } else {
      setError('No reset parameters found. Please use a valid password reset link.');
      setIsProcessingHash(false);
    }
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
      if (!accessToken) {
        throw new Error('No access token found');
      }
      
      console.log('Updating password with token:', accessToken.substring(0, 10) + '...');
      
      // Set the session with the access token before updating the user password
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });
      
      if (sessionError) {
        console.error('Error setting session:', sessionError);
        throw sessionError;
      }
      
      console.log('Session set successfully, updating password now');
      
      // Update the user password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }
      
      console.log('Password updated successfully');
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been reset. You can now sign in with your new password.",
      });
      
      // Close dialog and redirect to homepage
      setShowDialog(false);
      
      // Redirect to homepage and open sign-in dialog with email prefilled
      if (email) {
        navigate(`/?email=${encodeURIComponent(email)}`);
      } else {
        navigate('/');
      }
      
    } catch (error: any) {
      console.error('Password reset error details:', error);
      toast({
        title: "Password reset failed",
        description: error.message || "There was an error resetting your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while processing the hash parameters
  if (isProcessingHash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center">Processing Reset Link</h1>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  // If there's an error parameter in the URL hash, show an error message
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center">Reset Link Issue</h1>
          
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <p className="text-center text-muted-foreground">
            Please request a new password reset link.
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

  // Dialog for password reset
  return (
    <>
      {/* Main page content */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md p-6 space-y-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center">Reset Your Password</h1>
          
          {email && (
            <p className="text-sm text-center text-muted-foreground">
              A dialog will appear to set a new password for {email}
            </p>
          )}
          
          {!email && !error && (
            <p className="text-sm text-center text-muted-foreground">
              There was an issue processing your reset link. Please try again or request a new link.
            </p>
          )}
          
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Home
          </Button>
        </div>
      </div>
      
      {/* Reset Password Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) {
          navigate('/');
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
          </DialogHeader>
          
          {email && (
            <p className="text-sm text-muted-foreground">
              Setting new password for {email}
            </p>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
                  autoFocus
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
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResetPassword;
