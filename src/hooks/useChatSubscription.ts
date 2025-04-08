
import { useEffect, useState, useRef } from "react";
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
  const channelRef = useRef<any>(null);
  
  // Subscribe to new messages and booking requests via Supabase realtime
  useEffect(() => {
    if (!user) return;
    
    let attempts = 0;
    const maxAttempts = 5;
    console.log("Setting up realtime subscription for chat messages and booking requests");
    
    // Function to create and set up a channel
    const setupChannel = () => {
      // Cleanup old channel if exists
      if (channelRef.current) {
        console.log("Removing existing channel before creating a new one");
        try {
          supabase.removeChannel(channelRef.current);
        } catch (e) {
          console.error("Error removing previous channel:", e);
        }
        channelRef.current = null;
      }
      
      attempts++;
      console.log(`Creating new realtime channel (attempt ${attempts}/${maxAttempts})`);
      
      // Create a unique channel name to avoid conflicts
      const channelName = `chat-updates-${Date.now()}`;
      
      const channel = supabase.channel(channelName);
      channelRef.current = channel;

      // Set up event handlers before subscribing
      channel
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`
        }, (payload) => {
          console.log("Received new message via realtime:", payload);
          
          // Check if the payload has expected structure
          if (!payload || !payload.new) {
            console.error("Received malformed message payload:", payload);
            return;
          }
          
          // Check if it's a booking request
          const hasMetadata = payload.new.metadata && typeof payload.new.metadata === 'object';
          const isBookingRequest = 
            (hasMetadata && payload.new.metadata.type === 'booking_request') ||
            (typeof payload.new.content === 'string' && 
             payload.new.content.includes('Požiadavka na termín'));
          
          // Try to play notification sound
          try {
            const audio = new Audio('/message.mp3');
            audio.play().catch(e => console.log("Could not play notification sound", e));
          } catch (e) {
            console.error("Error playing notification sound:", e);
          }
          
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
          if (!payload || !payload.new) {
            console.error("Received malformed booking payload:", payload);
            return;
          }
          
          console.log("Received new booking request via realtime:", payload);
          
          // Try to play notification sound
          try {
            const audio = new Audio('/message.mp3');
            audio.play().catch(e => console.log("Could not play notification sound", e));
          } catch (e) {
            console.error("Error playing notification sound:", e);
          }
          
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
          // If messages are marked as read, update the contact list
          console.log("Message status changed:", payload);
          refetchContacts();
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'booking_requests'
        }, (payload) => {
          if (!payload || !payload.new) {
            console.error("Received malformed booking update payload:", payload);
            return;
          }
          
          console.log("Booking request updated:", payload);
          if (selectedContact?.conversation_id === payload.new.conversation_id) {
            refetchMessages();
          }
          refetchContacts();
        });
        
      // Add system event handlers for better monitoring
      channel
        .on('system', { event: 'connect' }, () => {
          console.log("WebSocket connection established");
          setSubscriptionFailed(false);
        })
        .on('system', { event: 'connected' }, () => {
          console.log("WebSocket connection fully established");
          setSubscriptionFailed(false);
        })
        .on('system', { event: 'open' }, () => {
          console.log("WebSocket connection opened");
          setSubscriptionFailed(false);
        })
        .on('system', { event: 'close' }, () => {
          console.log("WebSocket connection closed");
          // Connection closure will trigger reconnect logic via status handlers
        })
        .on('system', { event: 'error' }, (payload) => {
          console.error("WebSocket connection error", payload);
          setSubscriptionFailed(true);
        });

      // Subscribe with robust status handling
      channel.subscribe((status) => {
        console.log(`Realtime subscription status: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to realtime updates");
          if (subscriptionFailed) {
            toast.success("Pripojenie k realtime obnovené");
            setSubscriptionFailed(false);
          }
          attempts = 0; // Reset attempts on success
        } else if (status === 'CLOSED') {
          console.error("Realtime subscription closed");
          setSubscriptionFailed(true);
          
          // Try to reconnect if we haven't exceeded max attempts
          if (attempts < maxAttempts) {
            toast.warning("Realtime pripojenie bolo prerušené. Pokúšam sa znovu pripojiť...");
            setTimeout(() => {
              setupChannel();
            }, 1000 * Math.min(attempts, 3)); // Increasing delay up to 3 seconds
          } else {
            toast.error("Nepodarilo sa obnoviť realtime pripojenie. Skúste obnoviť stránku.");
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Realtime subscription error");
          setSubscriptionFailed(true);
          
          if (attempts < maxAttempts) {
            toast.error("Chyba realtime pripojenia. Pokúšam sa znovu pripojiť...");
            setTimeout(() => {
              setupChannel();
            }, 2000 * Math.min(attempts, 3)); // Increasing delay up to 6 seconds
          } else {
            toast.error("Nepodarilo sa obnoviť realtime pripojenie. Skúste obnoviť stránku.");
          }
        } else if (status === 'TIMED_OUT') {
          console.error("Realtime subscription timed out");
          setSubscriptionFailed(true);
          
          if (attempts < maxAttempts) {
            setTimeout(() => {
              setupChannel();
            }, 500); // Quick retry on timeout
          } else {
            toast.error("Realtime pripojenie opakovane vypršalo. Skúste obnoviť stránku.");
          }
        }
      });

      return channel;
    };

    // Initial setup
    const channel = setupChannel();
    
    // Function for checking connection health
    const checkConnectionHealth = async () => {
      try {
        const isConnected = await checkRealtimeConnection();
        
        if (!isConnected && !subscriptionFailed) {
          console.log("Health check failed - trying to reconnect");
          setSubscriptionFailed(true);
          setupChannel();
        } else if (isConnected && subscriptionFailed) {
          // Connection restored outside our knowledge
          console.log("Health check passed but we thought connection was down - updating state");
          setSubscriptionFailed(false);
        }
      } catch (e) {
        console.error("Error in health check:", e);
      }
    };
    
    // Implement periodic health check
    const healthCheckInterval = setInterval(checkConnectionHealth, 30000); // Check every 30 seconds
      
    return () => {
      console.log("Cleaning up realtime subscription");
      clearInterval(healthCheckInterval);
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        } catch (e) {
          console.error("Error removing channel during cleanup:", e);
        }
      }
    };
  }, [user, selectedContact, refetchMessages, refetchContacts, queryClient, subscriptionFailed]);

  return { subscriptionFailed };
};

// Helper function to check realtime connection
const checkRealtimeConnection = async (): Promise<boolean> => {
  try {
    // Use the implementation from supabase client
    const { checkRealtimeConnection } = await import('@/integrations/supabase/client');
    return await checkRealtimeConnection();
  } catch (error) {
    console.error("Failed to import checkRealtimeConnection:", error);
    return false;
  }
};
