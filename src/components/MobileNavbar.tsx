
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NotificationIndicator from "./notifications/NotificationIndicator";

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: "Domov", href: "/" },
    { label: "Kategórie", href: "/categories" },
    { label: "Blog", href: "/blog" },
    { label: "Ako to funguje", href: "/how-it-works" },
    { label: "Výhody", href: "/benefits" },
    { label: "Ceny", href: "/pricing" },
    { label: "O nás", href: "/about" },
    { label: "Kontakt", href: "/contact" },
  ];

  const closeSheet = () => setIsOpen(false);

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
            <Link to="/" className="flex items-center space-x-2" onClick={closeSheet}>
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
                  onClick={closeSheet}
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
                  <div className="flex items-center gap-2 mb-4">
                    <NotificationIndicator />
                    <span className="text-sm text-gray-600">Oznámenia</span>
                  </div>
                  
                  <Link to="/job-requests" onClick={closeSheet}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      Požiadavky
                    </Button>
                  </Link>
                  <Link to="/messages" onClick={closeSheet}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      Správy
                    </Button>
                  </Link>
                  <Link to="/profile" onClick={closeSheet}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      Profil
                    </Button>
                  </Link>
                  <Link to="/approved-bookings" onClick={closeSheet}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      Zákazky
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/job-requests" onClick={closeSheet}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      Požiadavky
                    </Button>
                  </Link>
                  <Link to="/login" onClick={closeSheet}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      Prihlásenie
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeSheet}>
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
