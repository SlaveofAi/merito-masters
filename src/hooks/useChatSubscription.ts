
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";
import { supabase, checkRealtimeConnection } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChatSubscription = (
  selectedContact: ChatContact | null,
  refetchMessages: () => void,
  refetchContacts: () => void
) => {
  const { user } = useAuth();
  const [subscriptionFailed, setSubscriptionFailed] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  
  // Function to check connection and reset state if needed
  const checkConnection = useCallback(async () => {
    try {
      const isConnected = await checkRealtimeConnection(2);
      if (!isConnected && subscribed) {
        console.log('Detected Supabase connection issue, resetting subscription state');
        setSubscribed(false);
      }
      return isConnected;
    } catch (err) {
      console.error('Error checking connection:', err);
      return false;
    }
  }, [subscribed]);

  useEffect(() => {
    if (!user || !selectedContact?.conversation_id) return;
    
    let channelCleanup: (() => void) | undefined;
    let intervalId: number | undefined;
    
    const setupRealtime = async () => {
      try {
        // Check connection status first
        const isConnected = await checkConnection();
        if (!isConnected) {
          console.log('Cannot set up subscription - connection check failed');
          setSubscriptionFailed(true);
          setSubscribed(false);
          return;
        }
        
        console.log(`Setting up subscription for conversation ${selectedContact.conversation_id}`);
        
        // Create a unique channel name to avoid conflicts
        const channelName = `conversation:${selectedContact.conversation_id}:${Date.now()}`;
        
        // Subscribe to all changes in the conversation
        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages',
              filter: `conversation_id=eq.${selectedContact.conversation_id}`
            },
            (payload) => {
              console.log('New message received via realtime:', payload);
              // Add a small delay to allow database operations to complete
              setTimeout(() => {
                refetchMessages();
                refetchContacts();
              }, 500);
            }
          )
          .subscribe((status) => {
            console.log(`Supabase channel status for ${channelName}: ${status}`);
            
            if (status === 'SUBSCRIBED') {
              setSubscribed(true);
              setSubscriptionFailed(false);
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Channel error occurred');
              setSubscriptionFailed(true);
              setSubscribed(false);
            }
          });
        
        // Return cleanup function
        channelCleanup = async () => {
          console.log(`Cleaning up subscription for ${channelName}`);
          try {
            await supabase.removeChannel(channel);
          } catch (err) {
            console.error('Error removing channel:', err);
          }
        };
      } catch (error) {
        console.error('Failed to set up realtime subscription:', error);
        setSubscriptionFailed(true);
        setSubscribed(false);
      }
    };
    
    // Initial setup
    setupRealtime();
    
    // Set up periodic connection checks
    intervalId = window.setInterval(async () => {
      const shouldRetry = !subscribed || subscriptionFailed;
      
      if (shouldRetry) {
        console.log('Attempting to reestablish realtime connection');
        // Clean up existing subscription if any
        if (channelCleanup) {
          await channelCleanup();
          channelCleanup = undefined;
        }
        
        // Try to set up a new subscription
        await setupRealtime();
      }
      
      // Always refresh data periodically as a fallback
      refetchMessages();
      refetchContacts();
    }, 8000);
    
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      
      if (channelCleanup) {
        channelCleanup();
      }
    };
  }, [user, selectedContact?.conversation_id, refetchMessages, refetchContacts, subscribed, subscriptionFailed, checkConnection]);

  return { 
    subscriptionFailed
  };
};
