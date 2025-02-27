
import { useState, useEffect } from "react";
import { 
  User, 
  HelpCircle, 
  Mail, 
  LogOut, 
  Trash2, 
  ChevronDown,
  Bookmark,
  LogIn
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAction = async (action: string) => {
    switch (action) {
      case "sign-in":
        toast({
          title: "Sign In",
          description: "Sign in coming soon",
        });
        break;
      case "sign-up":
        toast({
          title: "Sign Up",
          description: "Sign up coming soon",
        });
        break;
      case "logout":
        await supabase.auth.signOut();
        toast({
          title: "Signed out",
          description: "You have been signed out successfully",
        });
        break;
      case "saved-reviews":
        navigate("/saved-reviews");
        break;
      default:
        toast({
          title: "Action triggered",
          description: `${action} - Connect Supabase to enable this feature`,
        });
    }
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="font-semibold text-xl text-neutral-900">
            Design Critique
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-accent/10 text-accent">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 absolute -right-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                forceMount
              >
                {!user ? (
                  <>
                    <DropdownMenuItem onClick={() => handleAction("sign-in")}>
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Sign In</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("sign-up")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Sign Up</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAction("saved-reviews")}>
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>Saved Reviews</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleAction("support")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction("contact")}>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Contact us</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleAction("delete")}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete account</span>
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem onClick={() => handleAction("logout")}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
