
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";

export const useChatSubscription = (
  selectedContact: ChatContact | null,
  refetchMessages: () => void,
  refetchContacts: () => void
) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);

  // Subscribe to new messages and booking requests via Supabase realtime
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up realtime subscription for chat messages and booking requests");
    
    // Set up a single channel for all subscriptions with reconnection logic
    const setupChannel = () => {
      console.log("Creating new realtime channel");
      
      const channel = supabase
        .channel('chat-and-booking-updates')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`
        }, (payload) => {
          console.log("Received new message via realtime:", payload);
          
          // Check if it's a booking request by looking at content or metadata
          const hasMetadata = payload.new.metadata && typeof payload.new.metadata === 'object';
          const isBookingRequest = 
            (hasMetadata && payload.new.metadata.type === 'booking_request') ||
            (typeof payload.new.content === 'string' && 
             payload.new.content.includes('Požiadavka na termín'));
          
          // Play notification sound
          const audio = new Audio('/message.mp3');
          audio.play().catch(e => console.log("Could not play notification sound", e));
          
          // Show toast notification
          toast.success(isBookingRequest ? "Nová požiadavka na termín" : "Nová správa");
          
          // Refresh messages if conversation is selected
          if (selectedContact?.conversation_id === payload.new.conversation_id) {
            console.log("Refreshing messages for current conversation");
            refetchMessages();
          }
          
          // Refresh contact list
          refetchContacts();
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'booking_requests',
          filter: `craftsman_id=eq.${user.id}`
        }, (payload) => {
          console.log("Received new booking request via realtime:", payload);
          
          // Play notification sound
          const audio = new Audio('/message.mp3');
          audio.play().catch(e => console.log("Could not play notification sound", e));
          
          // Show toast notification
          toast.success("Nová požiadavka na termín");
          
          // Refresh messages if conversation is selected
          if (selectedContact?.conversation_id === payload.new.conversation_id) {
            console.log("Refreshing messages for current conversation with booking");
            refetchMessages();
          }
          
          // Refresh contact list
          refetchContacts();
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages'
        }, (payload) => {
          // If messages are marked as read, update the contact list to reflect new unread counts
          console.log("Message status changed:", payload);
          refetchContacts();
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'booking_requests'
        }, (payload) => {
          console.log("Booking request updated:", payload);
          // Refresh messages if relevant
          if (selectedContact?.conversation_id === payload.new.conversation_id) {
            refetchMessages();
          }
          refetchContacts();
        });

      // Add more robust reconnection and event handling
      channel
        .subscribe(async (status) => {
          console.log("Realtime subscription status:", status);
          
          if (status === 'SUBSCRIBED') {
            console.log("Successfully subscribed to realtime updates");
            if (subscriptionFailed) {
              toast.success("Pripojenie k realtime obnovené");
              setSubscriptionFailed(false);
            }
          } else if (status === 'CLOSED') {
            console.error("Realtime subscription closed");
            if (!subscriptionFailed) {
              toast.warning("Realtime pripojenie bolo prerušené. Pokúšam sa znovu pripojiť...");
              setSubscriptionFailed(true);
            }
            // Try to reconnect after a delay
            setTimeout(() => {
              console.log("Attempting to reconnect to realtime...");
              setupChannel();
            }, 5000);
          } else if (status === 'CHANNEL_ERROR') {
            console.error("Realtime subscription error");
            if (!subscriptionFailed) {
              toast.error("Chyba realtime pripojenia. Pokúšam sa znovu pripojiť...");
              setSubscriptionFailed(true);
            }
            // Try to reconnect after a delay with exponential backoff
            setTimeout(() => {
              console.log("Attempting to reconnect to realtime after error...");
              setupChannel();
            }, 8000);
          } else if (status === 'TIMED_OUT') {
            console.error("Realtime subscription timed out");
            if (!subscriptionFailed) {
              toast.warning("Realtime pripojenie vypršalo. Pokúšam sa znovu pripojiť...");
              setSubscriptionFailed(true);
            }
            // Immediate reconnect attempt
            setupChannel();
          }
        });

      return channel;
    };

    // Initial setup
    const channel = setupChannel();
    
    // Add a watchdog to check if the connection is still alive periodically
    const watchdogInterval = setInterval(async () => {
      try {
        // Ping the channel - if this fails, the onError handler above will trigger
        if (channel) {
          const subscription = channel.subscription;
          if (subscription && subscription.state === 'SUBSCRIBED') {
            console.log("Realtime connection is active");
          } else {
            console.log("Realtime connection appears to be inactive, reconnecting...");
            supabase.removeChannel(channel);
            setupChannel();
          }
        }
      } catch (e) {
        console.error("Error in realtime watchdog:", e);
      }
    }, 30000); // Check every 30 seconds
      
    return () => {
      console.log("Cleaning up realtime subscription");
      clearInterval(watchdogInterval);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, selectedContact, refetchMessages, refetchContacts, queryClient, subscriptionFailed]);

  return { subscriptionFailed };
};
