
import React from "react";
import { Link } from "react-router-dom";
import { DesktopMenu } from "./DesktopMenu";
import { MobileMenu } from "./MobileMenu";
import { DashboardSidebar } from "./DashboardSidebar";
import { useNavigation } from "./useNavigation";

export const Navigation = () => {
  const {
    isScrolled,
    user,
    isOpen,
    setIsOpen,
    isMenuOpen,
    setIsMenuOpen,
    handleSignOut,
    handleSignIn
  } = useNavigation();

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

        {/* Desktop Menu */}
        <DesktopMenu
          user={user}
          handleSignOut={handleSignOut}
          handleSignIn={handleSignIn}
          setIsOpen={setIsOpen}
        />

        {/* Mobile Menu */}
        <MobileMenu
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          user={user}
          handleSignOut={handleSignOut}
          handleSignIn={handleSignIn}
          setIsOpen={setIsOpen}
        />
      </div>

      {/* Dashboard Sidebar */}
      <DashboardSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleSignOut={handleSignOut}
      />
    </header>
  );
};
