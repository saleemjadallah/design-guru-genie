
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  History,
  LifeBuoy,
  Settings,
  Sparkles,
  Menu,
  X,
  LogOut
} from "lucide-react";

export const Navigation = () => {
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/7a4a7d46-2665-4c5b-9666-801339014a81.png" 
            alt="Evolvely.ai Logo" 
            className="h-24"
          />
        </Link>

        {/* Desktop Menu - Modified as requested */}
        <div className="hidden md:flex items-center space-x-1">
          <nav className="mr-4">
            <ul className="flex space-x-4">
              <li>
                <Link
                  to="/saved-reviews"
                  className="text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Saved Reviews
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </nav>

          {user ? (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => setIsOpen(true)}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div>
              <Button
                onClick={() => {
                  toast({
                    title: "Test Mode",
                    description: "Authentication is simulated in this demo.",
                  });
                }}
              >
                Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden rounded-md p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu - Update to match desktop menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container py-4">
            <nav className="mb-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/saved-reviews"
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Saved Reviews
                  </Link>
                </li>
                <li>
                  <a
                    href="#features"
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </nav>

            {user ? (
              <div className="space-y-2">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    setIsOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Test Mode",
                    description: "Authentication is simulated in this demo.",
                  });
                  setIsMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Dashboard Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0">
          <div className="py-4 h-full flex flex-col">
            <div className="px-6 mb-8">
              <Link to="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                <img 
                  src="/lovable-uploads/7a4a7d46-2665-4c5b-9666-801339014a81.png" 
                  alt="Evolvely.ai Logo" 
                  className="h-16"
                />
              </Link>
            </div>
            
            <div className="flex-1 px-3">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link to="/saved-reviews" onClick={() => setIsOpen(false)}>
                    <History className="mr-2 h-4 w-4" />
                    Analysis History
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
            
            <div className="px-3 py-2">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Help & Support
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};
