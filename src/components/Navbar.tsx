
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Menu, X, User, Hammer, Home, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CustomNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchUserType = async () => {
        const { data, error } = await supabase
          .from('user_types')
          .select('user_type')
          .eq('user_id', user.id)
          .single();
        
        if (data && !error) {
          setUserType(data.user_type);
        }
      };
      
      fetchUserType();
    } else {
      setUserType(null);
    }
  }, [user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Odhlásenie úspešné",
        description: "Boli ste úspešne odhlásený",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Chyba",
        description: "Nastala chyba pri odhlasovaní",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-white border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={user ? "/home" : "/"} className="text-2xl font-bold text-primary">
                Majstri.sk
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user ? (
                <>
                  <Link
                    to="/home"
                    className="border-transparent text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <Home className="mr-1.5 h-4 w-4" />
                    Domov
                  </Link>
                  <Link
                    to="/categories"
                    className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                  >
                    Kategórie
                  </Link>
                  {userType === 'customer' && (
                    <Link
                      to="/home"
                      className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                    >
                      Nájsť remeselníka
                    </Link>
                  )}
                  <Link
                    to="/bookings"
                    className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                  >
                    <Hammer className="mr-1.5 h-4 w-4" />
                    Zákazky
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/how-it-works"
                    className="border-transparent text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                  >
                    Ako to funguje
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {loading ? (
              <div className="h-9 w-20 bg-gray-100 animate-pulse rounded-md"></div>
            ) : user ? (
              <>
                <Link to="/messages">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Správy</span>
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Môj profil</span>
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleSignOut}>
                  Odhlásiť sa
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Prihlásiť sa</Button>
                </Link>
                <Link to="/register">
                  <Button>Registrovať sa</Button>
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Otvoriť hlavnú ponuku</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/home"
                  className="bg-gray-50 border-primary text-primary block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  onClick={toggleMenu}
                >
                  Domov
                </Link>
                <Link
                  to="/categories"
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  onClick={toggleMenu}
                >
                  Kategórie
                </Link>
                {userType === 'customer' && (
                  <Link
                    to="/home"
                    className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Nájsť remeselníka
                  </Link>
                )}
                <Link
                  to="/bookings"
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                  onClick={toggleMenu}
                >
                  Zákazky
                </Link>
              </>
            ) : (
              <Link
                to="/how-it-works"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                onClick={toggleMenu}
              >
                Ako to funguje
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-1">
                <Link
                  to="/messages"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Správy
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Môj profil
                </Link>
                <Link
                  to="/bookings"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Zákazky
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => {
                    handleSignOut();
                    toggleMenu();
                  }}
                >
                  Odhlásiť sa
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Prihlásiť sa
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  onClick={toggleMenu}
                >
                  Registrovať sa
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default CustomNavigation;
