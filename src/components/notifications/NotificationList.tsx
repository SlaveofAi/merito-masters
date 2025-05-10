
import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationSubscription } from "@/hooks/useNotificationSubscription";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BellDot, MessageSquare, CalendarCheck, CalendarX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";
import NotificationItem from "./NotificationItem";
import { Notification } from "@/types/notification";

const NotificationList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    notificationsLoading, 
    markAllAsRead, 
    refetchNotifications 
  } = useNotifications();
  
  // Set up real-time subscription for notifications
  useNotificationSubscription(refetchNotifications);

  // Function to handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read immediately
    if (!notification.read) {
      markAllAsRead();
    }
    
    // Navigate based on notification type
    if (notification.type === 'message' && notification.metadata?.conversation_id) {
      navigate(`/messages?conversation=${notification.metadata.conversation_id}`);
    } else if (notification.type === 'booking_request' || notification.type === 'booking_update') {
      navigate('/bookings');
    }
  };

  if (notificationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifikácie</CardTitle>
          <CardDescription>Vaše posledné notifikácie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!notifications.length) {
    return (
      <Card className="text-center py-10">
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <BellDot className="h-12 w-12 text-gray-400" />
            <h3 className="text-xl font-medium">Žiadne notifikácie</h3>
            <p className="text-gray-600">Momentálne nemáte žiadne notifikácie.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notifikácie</CardTitle>
          <CardDescription>Vaše posledné notifikácie a upozornenia</CardDescription>
        </div>
        {notifications.some(n => !n.read) && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
            Označiť všetky ako prečítané
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationItem 
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationList;
