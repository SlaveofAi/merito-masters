
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Notification } from "@/types/notification";

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading, error, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          throw error;
        }

        return data as Notification[];
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
        return [];
      }
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
    onError: (error) => {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to update notification");
    },
  });

  // Mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to update notifications");
    },
  });

  // Clear a notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
    onError: (error) => {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    },
  });

  // Get unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return {
    notifications,
    notificationsLoading,
    error,
    unreadCount,
    refetchNotifications: refetch,
    markAsRead: (id: string) => markAsRead.mutate(id),
    markAllAsRead: () => markAllAsRead.mutate(),
    deleteNotification: (id: string) => deleteNotification.mutate(id),
  };
};
