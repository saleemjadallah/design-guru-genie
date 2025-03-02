
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type DesktopMenuProps = {
  user: any;
  handleSignOut: () => Promise<void>;
  handleSignIn: () => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
};

export const DesktopMenu = ({
  user,
  handleSignOut,
  handleSignIn,
  setIsOpen,
}: DesktopMenuProps) => {
  return (
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
          <Button onClick={handleSignIn}>
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
};
