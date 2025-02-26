
import { useState } from "react";
import { 
  User, 
  HelpCircle, 
  Mail, 
  LogOut, 
  Trash2, 
  ChevronDown 
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
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-12 w-12 rounded-full hover:bg-accent/10"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-accent/10 text-accent">
                      <User className="h-6 w-6" />
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
                {!mockUser ? (
                  <>
                    <DropdownMenuItem onClick={() => handleAction("sign-in")}>
                      <LogOut className="mr-2 h-4 w-4" />
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
                        <p className="text-sm font-medium leading-none">username@example.com</p>
                      </div>
                    </DropdownMenuLabel>
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
                {mockUser && (
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
