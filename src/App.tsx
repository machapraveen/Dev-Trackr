import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { supabase } from "@/lib/supabaseClient";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('Existing session found:', session.user.email, 'ID:', session.user.id);
          
          // Ensure user exists in users table
          await ensureUserInDatabase(session.user.id, session.user.email || '');
          
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // Try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'praveenmacha777@gmail.com',
          password: 'Kakinada@143',
        });

        if (signInError) {
          console.log('Sign-in error, attempting to sign up:', signInError.message);
          
          // If sign in fails, try to sign up
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'praveenmacha777@gmail.com',
            password: 'Kakinada@143',
          });

          if (signUpError) {
            console.error('Signup error:', signUpError.message);
            setAuthError(`Failed to create user: ${signUpError.message}`);
            setIsLoading(false);
            return;
          }

          if (signUpData.user) {
            console.log('User signed up:', signUpData.user.email, 'ID:', signUpData.user.id);
            
            // Create user in database
            await ensureUserInDatabase(signUpData.user.id, signUpData.user.email || '');
            
            // Check if we need email confirmation
            if (!signUpData.session) {
              console.log('Email confirmation may be required');
              setAuthError('Please check your email for confirmation link');
              setIsLoading(false);
              return;
            }
            
            setIsAuthenticated(true);
            setIsLoading(false);
          }
        } else if (signInData.user) {
          console.log('Signed in successfully:', signInData.user.email, 'ID:', signInData.user.id);
          
          // Ensure user exists in users table
          await ensureUserInDatabase(signInData.user.id, signInData.user.email || '');
          
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setAuthError('Authentication failed');
        setIsLoading(false);
      }
    };

    // Function to ensure user exists in database
    const ensureUserInDatabase = async (userId: string, email: string) => {
      try {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();

        if (!existingUser) {
          // User doesn't exist, create them
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ 
              id: userId, 
              email: email,
              created_at: new Date().toISOString()
            }]);

          if (insertError) {
            console.error('Error creating user in database:', insertError);
            // Don't throw error, as auth user exists
          } else {
            console.log('User created in database:', userId);
          }
        } else {
          console.log('User already exists in database:', userId);
        }
      } catch (error) {
        console.error('Error checking/creating user:', error);
        // Don't throw error, as auth user exists
      }
    };

    handleAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Ensure user exists in database when signing in
        await ensureUserInDatabase(session.user.id, session.user.email || '');
        setIsAuthenticated(true);
        setAuthError(null);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setAuthError('Session expired');
      }
      
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 text-center">
          <div className="text-red-500 mb-4">Error: {authError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
