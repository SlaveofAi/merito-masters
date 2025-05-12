
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import NotificationIndicator from "./notifications/NotificationIndicator";
import { MessageSquare } from "lucide-react";

interface NavigationWithNotificationProps {
  className?: string;
}

const NavigationWithNotification: React.FC<NavigationWithNotificationProps> = ({ className }) => {
  const { user, userType } = useAuth();
  const location = useLocation();

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Only show notifications button if user is logged in */}
      {user && (
        <NotificationIndicator />
      )}
      
      {/* Navigation links based on authentication state */}
      {user ? (
        <>
          <Link to="/messages">
            <Button variant="ghost">
              <MessageSquare className="mr-2 h-4 w-4" />
              Správy
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost">Profil</Button>
          </Link>
          {/* Show bookings button for all users, not just craftsmen */}
          <Link to="/bookings">
            <Button variant="ghost">Zákazky</Button>
          </Link>
        </>
      ) : (
        <>
          <Link to="/login">
            <Button variant="ghost">Prihlásenie</Button>
          </Link>
          <Link to="/register">
            <Button 
              variant="default" 
              className="bg-primary text-white hover:bg-primary-dark transition-colors duration-200"
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
