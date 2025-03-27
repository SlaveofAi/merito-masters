
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogIn } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-semibold tracking-tight">
              Majstri<span className="text-muted-foreground">.sk</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Domov
            </Link>
            <Link
              to="/craftsmen"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Remeselníci
            </Link>
            <Link
              to="/about"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              O nás
            </Link>
            <Link
              to="/contact"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              Kontakt
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" size="sm" className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" />
                Prihlásiť sa
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Registrovať sa
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary transition-colors"
            >
              Domov
            </Link>
            <Link
              to="/craftsmen"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary transition-colors"
            >
              Remeselníci
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary transition-colors"
            >
              O nás
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary transition-colors"
            >
              Kontakt
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <Link to="/login" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-center mb-2"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Prihlásiť sa
                  </Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button className="w-full justify-center">
                    <User className="mr-2 h-4 w-4" />
                    Registrovať sa
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
