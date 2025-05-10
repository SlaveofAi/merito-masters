
import React from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationSubscription } from "@/hooks/useNotificationSubscription";
import { Bell, BellDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const NotificationIndicator: React.FC = () => {
  const { unreadCount, refetchNotifications } = useNotifications();
  
  // Set up real-time subscription
  useNotificationSubscription(refetchNotifications);
  
  return (
    <Link to="/notifications">
      <Button variant="ghost" size="icon" className="relative">
        {unreadCount > 0 ? (
          <>
            <BellDot className="h-5 w-5" />
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-5 bg-primary text-white text-xs flex items-center justify-center rounded-full p-0 px-1"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          </>
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </Button>
    </Link>
  );
};

export default NotificationIndicator;
