
import { Link } from "react-router-dom";
import { useNavigation } from "./useNavigation";
import { DesktopMenu } from "./DesktopMenu";
import { MobileMenu } from "./MobileMenu";

export const Navigation = () => {
  const { 
    isScrolled, 
    user, 
    isMenuOpen, 
    setIsMenuOpen, 
    handleSignOut,
    isLoading
  } = useNavigation();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        isScrolled ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Design Guru
          </Link>

          <DesktopMenu 
            user={user} 
            handleSignOut={handleSignOut} 
            isLoading={isLoading}
          />
          
          <MobileMenu 
            isMenuOpen={isMenuOpen} 
            setIsMenuOpen={setIsMenuOpen} 
            user={user} 
            handleSignOut={handleSignOut}
            isLoading={isLoading}
          />
        </div>
      </div>
    </header>
  );
};
