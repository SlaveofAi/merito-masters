
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, CalendarCheck, CalendarX, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const { markAsRead, deleteNotification } = useNotifications();

  // Format relative time
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { 
    addSuffix: true, 
    locale: sk 
  });

  // Get the correct icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'booking_request':
        return <CalendarCheck className="h-5 w-5" />;
      case 'booking_update':
        if (notification.metadata?.status === 'approved') {
          return <CalendarCheck className="h-5 w-5" />;
        } else {
          return <CalendarX className="h-5 w-5" />;
        }
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:bg-gray-50 relative transition-all ${
        !notification.read ? "border-l-4 border-l-primary" : ""
      }`}
      onClick={() => {
        if (!notification.read) {
          markAsRead(notification.id);
        }
        onClick();
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${!notification.read ? "bg-primary-50" : "bg-gray-100"}`}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium">{notification.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
            <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
          >
            Zmazať
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;
