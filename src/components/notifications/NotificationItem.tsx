
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";
import { 
  MessageSquare, 
  CalendarCheck, 
  CalendarX, 
  Calendar, 
  Crown, 
  Bell,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notification } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
}) => {
  // Get the appropriate icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare className="text-blue-500" />;
      case 'booking_request':
        return <Calendar className="text-green-500" />;
      case 'booking_update':
        return notification.metadata?.status === 'approved' 
          ? <CalendarCheck className="text-green-500" /> 
          : <CalendarX className="text-red-500" />;
      case 'topped_status':
        return <Crown className="text-yellow-500 fill-yellow-500" />;
      default:
        return <Bell className="text-gray-500" />;
    }
  };

  // Format the date to show how long ago the notification was created
  const formattedDate = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: sk,
  });

  // Get appropriate background color based on notification type and read status
  const getBgColor = () => {
    if (notification.read) return "bg-white hover:bg-gray-50";
    
    switch (notification.type) {
      case 'message':
        return "bg-blue-50 hover:bg-blue-100";
      case 'booking_request':
        return "bg-green-50 hover:bg-green-100";
      case 'booking_update':
        return notification.metadata?.status === 'approved'
          ? "bg-green-50 hover:bg-green-100"
          : "bg-red-50 hover:bg-red-100";
      case 'topped_status':
        return "bg-yellow-50 hover:bg-yellow-100";
      default:
        return "bg-gray-50 hover:bg-gray-100";
    }
  };

  return (
    <div 
      className={`rounded-lg p-4 transition-colors cursor-pointer ${getBgColor()} flex items-start gap-4 relative`}
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
            {notification.title}
          </h4>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
        
        {/* Additional content based on notification type */}
        {notification.type === 'topped_status' && notification.metadata?.topped_until && (
          <div className="mt-2 flex items-center text-xs text-yellow-700 font-medium">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            <span>Platné do {new Date(notification.metadata.topped_until).toLocaleDateString()}</span>
          </div>
        )}
        
        {onMarkAsRead && !notification.read && (
          <div className="mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead();
              }}
            >
              Označiť ako prečítané
            </Button>
          </div>
        )}
      </div>
      
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-600"></div>
      )}
    </div>
  );
};

export default NotificationItem;
