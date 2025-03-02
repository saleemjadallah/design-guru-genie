
import React from "react";
import { Link } from "react-router-dom";
import { X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type MobileMenuProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  user: any;
  handleSignOut: () => Promise<void>;
  handleSignIn: () => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
};

export const MobileMenu = ({
  isMenuOpen,
  setIsMenuOpen,
  user,
  handleSignOut,
  handleSignIn,
  setIsOpen,
}: MobileMenuProps) => {
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden rounded-md p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Content */}
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
                  handleSignIn();
                  setIsMenuOpen(false);
                }}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
