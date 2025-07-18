
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Bell, BellDot, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationSubscription } from "@/hooks/useNotificationSubscription";
import { Badge } from "@/components/ui/badge";

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { unreadCount, refetchNotifications } = useNotifications();
  
  // Set up real-time subscription
  useNotificationSubscription(refetchNotifications);

  const navItems = [
    { label: "Domov", href: "/" },
    { label: "Kategórie", href: "/categories" },
    { label: "Blog", href: "/blog" },
    { label: "Kontakt", href: "/contact" },
  ];

  const closeSheet = () => setIsOpen(false);

  const handleLinkClick = () => {
    closeSheet();
    // Scroll to top when clicking navigation links
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      closeSheet();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/" className="flex items-center space-x-2" onClick={handleLinkClick}>
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="font-bold text-lg text-gray-900">Majstri.com</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={handleLinkClick}
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:text-primary hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Separator */}
            <div className="border-t my-4"></div>

            {/* User Actions */}
            <div className="space-y-2">
              {user ? (
                <>
                  <Link
                    to="/notifications"
                    onClick={handleLinkClick}
                    className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === "/notifications"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 ? (
                        <BellDot className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                      <span>Oznámenia</span>
                    </div>
                    {unreadCount > 0 && (
                      <Badge className="h-5 min-w-5 bg-primary text-white text-xs flex items-center justify-center rounded-full p-0 px-1">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Link>
                  
                  <Link
                    to="/job-requests"
                    onClick={handleLinkClick}
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === "/job-requests"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    Požiadavky
                  </Link>
                  <Link
                    to="/messages"
                    onClick={handleLinkClick}
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === "/messages"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    Správy
                  </Link>
                  <Link
                    to="/profile"
                    onClick={handleLinkClick}
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === "/profile"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    Profil
                  </Link>
                  <Link
                    to="/approved-bookings"
                    onClick={handleLinkClick}
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === "/approved-bookings"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    Zákazky
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Odhlásiť sa</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/job-requests"
                    onClick={handleLinkClick}
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === "/job-requests"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    Požiadavky
                  </Link>
                  <Link
                    to="/login"
                    onClick={handleLinkClick}
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === "/login"
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    Prihlásenie
                  </Link>
                  <Link to="/register" onClick={handleLinkClick}>
                    <Button className="w-full text-sm mt-2">
                      Registrácia
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavbar;
