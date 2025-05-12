
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import NavigationWithNotification from "./NavigationWithNotification";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Determine if user is logged in and where to navigate when clicking logo
  const logoLinkPath = user ? "/home" : "/";
  const isLoggedIn = !!user;

  const handleSignOut = async (e) => {
    e.preventDefault();
    await signOut();
    // Force reload the page to ensure all auth state is cleared
    window.location.href = '/';
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Link to either home page or landing page based on user authentication */}
          <Link to={logoLinkPath} className="flex items-center">
            <span className="text-xl font-bold text-black">Majstri.com</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavigationWithNotification />
            {isLoggedIn && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleSignOut}
                className="ml-2"
              >
                <LogOut className="w-4 h-4 mr-2" /> Odhlásiť sa
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {isLoggedIn ? (
                    <>
                      <Link to="/notifications">
                        <Button variant="ghost" className="w-full justify-start">Notifikácie</Button>
                      </Link>
                      <Link to="/messages">
                        <Button variant="ghost" className="w-full justify-start">Správy</Button>
                      </Link>
                      <Link to="/profile">
                        <Button variant="ghost" className="w-full justify-start">Profil</Button>
                      </Link>
                      <Link to="/bookings">
                        <Button variant="ghost" className="w-full justify-start">Zákazky</Button>
                      </Link>
                      <Button onClick={handleSignOut} variant="destructive" className="w-full justify-start">
                        <LogOut className="w-4 h-4 mr-2" /> Odhlásiť sa
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button variant="ghost" className="w-full justify-start">Prihlásenie</Button>
                      </Link>
                      <Link to="/register">
                        <Button variant="default" className="w-full bg-primary text-white">
                          Registrácia
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
