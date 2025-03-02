
import React from "react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  History,
  LifeBuoy,
  Settings,
  Sparkles,
  LogOut
} from "lucide-react";

type DashboardSidebarProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleSignOut: () => Promise<void>;
};

export const DashboardSidebar = ({
  isOpen,
  setIsOpen,
  handleSignOut,
}: DashboardSidebarProps) => {
  return (
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
  );
};
