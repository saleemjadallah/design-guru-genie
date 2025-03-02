
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Menu, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 p-0">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-neutral-100">
                <UserRound size={28} className="text-purple-500 fill-purple-100" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 mt-1 bg-white">
          {user ? (
            <>
              <DropdownMenuItem disabled className="opacity-70">
                {user.email && user.email.split('@')[0]}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link to="/">
                <DropdownMenuItem>Home</DropdownMenuItem>
              </Link>
              <Link to="/saved-reviews">
                <DropdownMenuItem>Saved Reviews</DropdownMenuItem>
              </Link>
              <Link to="/#pricing">
                <DropdownMenuItem>Pricing</DropdownMenuItem>
              </Link>
              <Link to="/support">
                <DropdownMenuItem>Support</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} disabled={isLoading} className="text-red-600 hover:text-red-800 hover:bg-red-50">
                {isLoading ? "Signing out..." : "Delete Account"}
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <Link to="/">
                <DropdownMenuItem>Home</DropdownMenuItem>
              </Link>
              <Link to="/auth">
                <DropdownMenuItem disabled={isLoading}>
                  {isLoading ? "Loading..." : "Sign in"}
                </DropdownMenuItem>
              </Link>
              <Link to="/auth?signup=true">
                <DropdownMenuItem>Sign up</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link to="/#pricing">
                <DropdownMenuItem>Pricing</DropdownMenuItem>
              </Link>
              <Link to="/support">
                <DropdownMenuItem>Support</DropdownMenuItem>
              </Link>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
