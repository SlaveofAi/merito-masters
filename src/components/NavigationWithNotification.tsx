
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import NotificationIndicator from "./notifications/NotificationIndicator";
import { MessageSquare, Briefcase } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavigationWithNotificationProps {
  className?: string;
}

const NavigationWithNotification: React.FC<NavigationWithNotificationProps> = ({ className }) => {
  const { user, userType } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <div className={`flex items-center space-x-2 sm:space-x-4 ${className}`}>
      {/* Only show notifications button if user is logged in */}
      {user && (
        <NotificationIndicator />
      )}
      
      {/* Navigation links based on authentication state */}
      {user ? (
        <>
          <Link to="/job-requests">
            <Button variant="ghost" size={isMobile ? "sm" : "default"} className="flex items-center gap-1 sm:gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden xs:inline">Požiadavky</span>
            </Button>
          </Link>
          <Link to="/messages">
            <Button variant="ghost" size={isMobile ? "sm" : "default"} className="flex items-center gap-1 sm:gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden xs:inline">Správy</span>
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size={isMobile ? "sm" : "default"}>
              <span className="hidden xs:inline">Profil</span>
              <span className="xs:hidden">👤</span>
            </Button>
          </Link>
          {/* Show bookings button for all users, not just craftsmen */}
          <Link to="/approved-bookings">
            <Button variant="ghost" size={isMobile ? "sm" : "default"} className="flex items-center gap-1 sm:gap-2">
              <span className="hidden xs:inline">Zákazky</span>
              <span className="xs:hidden">📋</span>
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link to="/job-requests">
            <Button variant="ghost" size={isMobile ? "sm" : "default"} className="flex items-center gap-1 sm:gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden xs:inline">Požiadavky</span>
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size={isMobile ? "sm" : "default"}>
              <span className="hidden xs:inline">Prihlásenie</span>
              <span className="xs:hidden">🔑</span>
            </Button>
          </Link>
          <Link to="/register">
            <Button 
              variant="default" 
              size={isMobile ? "sm" : "default"}
              className="bg-primary text-white hover:bg-primary-dark transition-colors duration-200"
            >
              <span className="hidden xs:inline">Registrácia</span>
              <span className="xs:hidden">📝</span>
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default NavigationWithNotification;
