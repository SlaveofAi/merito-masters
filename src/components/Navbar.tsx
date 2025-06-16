
import React from "react";
import { Link, useLocation } from "react-router-dom";
import NavigationWithNotification from "./NavigationWithNotification";
import MobileNavbar from "./MobileNavbar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: "Domov", href: "/" },
    { label: "Kategórie", href: "/categories" },
    { label: "Blog", href: "/blog" },
    { label: "Kontakt", href: "/contact" },
  ];

  const handleLinkClick = () => {
    // Scroll to top when clicking navigation links
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={handleLinkClick}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Majstri.com</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleLinkClick}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side navigation */}
          <div className="flex items-center gap-2">
            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <NavigationWithNotification />
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-700 hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden xl:inline">Odhlásiť sa</span>
                </Button>
              )}
            </div>
            
            {/* Mobile navigation */}
            <MobileNavbar />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
