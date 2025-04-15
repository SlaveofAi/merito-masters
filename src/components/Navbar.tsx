
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Home, User, MessageSquare, LogOut, Briefcase } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const { user, userType, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  return (
    <nav
      className={`w-full py-4 transition-all duration-300 ${
        scrolled || !isHomePage
          ? "bg-white shadow-sm"
          : "bg-transparent"
      } fixed top-0 z-50`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link 
          to="/home" 
          className="text-xl font-bold hover:opacity-80 transition-opacity"
        >
          Majstri.sk
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/home")}
                className={isMobile ? "" : "hidden sm:flex"}
              >
                <Home className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/messages")}
                className={isMobile ? "" : "hidden sm:flex"}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              
              {/* Add Orders link - show only for logged in users */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/orders")}
                className={isMobile ? "" : "hidden sm:flex"}
              >
                <Briefcase className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar>
                      <AvatarImage
                        src={user.user_metadata?.avatar_url}
                        alt={user.user_metadata?.name || "User"}
                      />
                      <AvatarFallback>
                        {user.user_metadata?.name
                          ? getInitials(user.user_metadata.name)
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Môj účet</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/home")}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Domov</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Správy</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Zákazky</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Odhlásiť sa</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="hidden sm:block"
              >
                Prihlásiť sa
              </Button>
              <Button onClick={() => navigate("/register")}>
                Registrovať sa
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
