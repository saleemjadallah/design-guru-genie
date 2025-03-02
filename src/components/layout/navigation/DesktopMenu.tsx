
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User } from "lucide-react";

type DesktopMenuProps = {
  user: any;
  handleSignOut: () => Promise<void>;
  isLoading: boolean;
};

export const DesktopMenu = ({ user, handleSignOut, isLoading }: DesktopMenuProps) => {
  return (
    <div className="hidden md:flex space-x-6 items-center">
      <Link
        to="/"
        className="text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        Home
      </Link>
      
      {user ? (
        <>
          <Link
            to="/saved-reviews"
            className="text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Saved Reviews
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User size={16} />
                {user.email && user.email.split('@')[0]}
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
                {isLoading ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Link to="/auth">
          <Button variant="outline" disabled={isLoading}>
            {isLoading ? "Loading..." : "Sign in"}
          </Button>
        </Link>
      )}
    </div>
  );
};
