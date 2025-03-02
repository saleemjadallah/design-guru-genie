
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";

type MobileMenuProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  user: any;
  handleSignOut: () => Promise<void>;
  isLoading: boolean;
};

export const MobileMenu = ({
  isMenuOpen,
  setIsMenuOpen,
  user,
  handleSignOut,
  isLoading
}: MobileMenuProps) => {
  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg p-4 z-50 flex flex-col space-y-4">
          <Link
            to="/"
            className="text-neutral-600 hover:text-neutral-900 py-2 px-4 rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          
          {user ? (
            <>
              <Link
                to="/saved-reviews"
                className="text-neutral-600 hover:text-neutral-900 py-2 px-4 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Saved Reviews
              </Link>
              
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                disabled={isLoading}
              >
                {isLoading ? "Signing out..." : "Sign out"}
              </Button>
            </>
          ) : (
            <Link 
              to="/auth"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button variant="outline" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : "Sign in"}
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
