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

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Existing session found:', session.user.email, 'ID:', session.user.id);
        setIsAuthenticated(true);
        return;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'praveenmacha777@gmail.com',
        password: 'Kakinada@143',
      });

      if (signInError) {
        console.error('Sign-in error:', signInError.message);
        if (signInError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'praveenmacha777@gmail.com',
            password: 'Kakinada@143',
          });

          if (signUpError) {
            console.error('Signup error:', signUpError.message);
            setAuthError(`Failed to create user: ${signUpError.message}`);
          } else {
            console.log('User signed up:', signUpData.user?.email, 'ID:', signUpData.user?.id);
            await supabase.from('users').upsert([{ id: signUpData.user?.id, email: 'praveenmacha777@gmail.com' }]);
            await supabase.from('quick_links').update({ user_id: signUpData.user?.id }).is('user_id', null);
            setIsAuthenticated(true);
          }
        } else {
          setAuthError(`Authentication error: ${signInError.message}`);
        }
      } else {
        console.log('Signed in as:', signInData.user?.email, 'ID:', signInData.user?.id);
        await supabase.from('users').upsert([{ id: signInData.user?.id, email: 'praveenmacha777@gmail.com' }]);
        await supabase.from('quick_links').update({ user_id: signInData.user?.id }).is('user_id', null);
        setIsAuthenticated(true);
      }
    };

    handleAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email, 'ID:', session?.user?.id);
      setIsAuthenticated(!!session);
      if (!session) setAuthError('Session expired, attempting to re-authenticate...');
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (authError) {
    return <div className="p-4 text-red-500">Error: {authError}</div>;
  }

  if (!isAuthenticated) {
    return <div className="p-4">Authenticating...</div>;
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