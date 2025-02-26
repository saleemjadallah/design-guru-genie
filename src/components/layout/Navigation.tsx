
import { useState } from "react";
import { 
  User, 
  Settings, 
  HelpCircle, 
  Mail, 
  LogOut, 
  Trash2, 
  ChevronDown,
  CreditCard
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

const mockUser = null; // Replace with actual user state later

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignIn = () => {
    toast({
      title: "Authentication required",
      description: "Please connect Supabase to enable authentication",
    });
  };

  const handleAction = (action: string) => {
    toast({
      title: "Action triggered",
      description: `${action} - Connect Supabase to enable this feature`,
    });
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
            {mockUser ? (
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-accent/10 text-accent">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 absolute -right-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">username@example.com</p>
                      <p className="text-xs leading-none text-neutral-500">
                        Free Plan
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleAction("profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("subscription")}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Subscription</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleAction("support")}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Support</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAction("contact")}>
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Contact</span>
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
                  <DropdownMenuItem onClick={() => handleAction("logout")}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="bg-accent hover:bg-accent/90" onClick={handleSignIn}>
                Sign In / Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
