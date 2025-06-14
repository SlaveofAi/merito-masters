
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import NotificationIndicator from "./notifications/NotificationIndicator";

interface NavigationWithNotificationProps {
  className?: string;
}

const NavigationWithNotification: React.FC<NavigationWithNotificationProps> = ({ className }) => {
  const { user } = useAuth();

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Only show notifications button if user is logged in */}
      {user && (
        <NotificationIndicator />
      )}
      
      {/* Navigation links based on authentication state */}
      {user ? (
        <>
          <Link to="/job-requests">
            <Button variant="ghost">
              Požiadavky
            </Button>
          </Link>
          <Link to="/messages">
            <Button variant="ghost">
              Správy
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost">
              Profil
            </Button>
          </Link>
          <Link to="/approved-bookings">
            <Button variant="ghost">
              Zákazky
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link to="/job-requests">
            <Button variant="ghost">
              Požiadavky
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost">
              Prihlásenie
            </Button>
          </Link>
          <Link to="/register">
            <Button 
              variant="default" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
            >
              Registrácia
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default NavigationWithNotification;
