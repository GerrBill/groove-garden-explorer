import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { sendEmail } from '@/utils/email';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add a ref to track if this is the initial auth check
  const isInitialAuthCheck = useRef(true);
  // Track the last sign-in time to avoid duplicate toasts
  const lastSignInTime = useRef<number | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Only show toast notifications for explicit user actions, not automatic session refreshes
        // And don't show during initial auth check
        const currentTime = Date.now();
        
        if (!isInitialAuthCheck.current) {
          if (event === 'SIGNED_IN') {
            // Avoid duplicate sign-in notifications within a short timeframe
            if (!lastSignInTime.current || currentTime - lastSignInTime.current > 5000) {
              toast({
                title: "Welcome back!",
                description: "You have successfully signed in.",
              });
              lastSignInTime.current = currentTime;
              
              // Log login activity
              try {
                // Get IP address (in a real app this would come from a service)
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                
                // Insert login record
                await supabase.from('login_audit').insert({
                  email: newSession?.user?.email || '',
                  user_id: newSession?.user?.id,
                  ip_address: ipData.ip,
                  user_agent: navigator.userAgent
                });
              } catch (error) {
                console.error('Error logging login activity:', error);
              }
            }
          }
          
          if (event === 'SIGNED_OUT') {
            toast({
              title: "Signed out",
              description: "You have been signed out successfully.",
            });
          }
          
          if (event === 'PASSWORD_RECOVERY') {
            toast({
              title: "Password recovery",
              description: "You can now reset your password.",
            });
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      // Mark initial auth check as complete
      isInitialAuthCheck.current = false;
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created",
        description: "Check your email for a confirmation link.",
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Use window.location.origin to dynamically get the current domain
      // This will work in both development and production environments
      const baseUrl = window.location.origin;
      
      // Using only the supported properties in the options object
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      // Send a custom email instead of using Supabase's default
      try {
        if (session?.access_token) {
          await sendEmail(
            email,
            "Reset Your GerrbillMedia Password",
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h2 style="color: #FF5500;">Reset Your GerrbillMedia Password</h2>
              <p>We received a request to reset your password. A password reset link has been sent to you via Supabase.</p>
              <p>Please check your email for the password reset link from Supabase and follow the instructions to reset your password.</p>
              <p>If you did not request a password reset, please ignore the Supabase email and contact support immediately.</p>
              <p>Thank you,<br>The GerrbillMedia Team</p>
            </div>
            `,
            session.access_token
          );
        }
      } catch (emailError) {
        console.error('Error sending custom password reset email:', emailError);
        // We still proceed since Supabase sent the original reset email
      }
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
