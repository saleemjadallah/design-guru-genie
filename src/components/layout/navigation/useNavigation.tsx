
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account.",
    });
  };

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'user@example.com',
        password: 'password123',
      });
      
      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "You have been signed into your account.",
      });
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Failed to sign in",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return {
    isScrolled,
    user,
    isOpen,
    setIsOpen,
    isMenuOpen,
    setIsMenuOpen,
    handleSignOut,
    handleSignIn
  };
};
