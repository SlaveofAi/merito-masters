
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useNotificationSubscription = (
  refetchNotifications: () => void
) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log("Setting up notification subscription for user:", user.id);

    // Subscribe to notifications for this user
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          refetchNotifications();
          
          // Show toast for real-time notification
          const notification = payload.new;
          if (notification) {
            toast(
              notification.title,
              {
                description: notification.content,
                duration: 5000,
              }
            );
          }
        }
      )
      .subscribe((status) => {
        console.log(`Notification subscription status: ${status}`);
        if (status === 'CHANNEL_ERROR') {
          console.error("Error with notification channel. Reconnecting...");
          setTimeout(() => {
            channel.subscribe();
          }, 2000);
        }
      });

    // Cleanup function
    return () => {
      console.log("Cleaning up notification subscription");
      supabase.removeChannel(channel);
    };
  }, [user, refetchNotifications]);

  return {};
};
