import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ChatContact } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

export const useChatSubscription = (
  selectedContact: ChatContact | null,
  refetchMessages: () => void,
  refetchContacts: () => void
) => {
  const { user } = useAuth();
  const subscriptionsRef = useRef<{ userChannel: any; conversationChannel: any }>({
    userChannel: null,
    conversationChannel: null
  });
  
  // Keep track of setup attempts to avoid infinite retries
  const setupAttemptsRef = useRef({
    userChannel: 0,
    conversationChannel: 0
  });
  
  useEffect(() => {
    if (!user) return;
    
    // Create a unique channel name for the user with timestamp to avoid conflicts
    const userChannelName = `user-messages-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    console.log(`Setting up global user subscription for ${userChannelName}`);
    
    const setupUserChannel = () => {
      try {
        // Remove any existing subscription to avoid duplicates
        if (subscriptionsRef.current.userChannel) {
          console.log("Removing existing user channel subscription");
          supabase.removeChannel(subscriptionsRef.current.userChannel);
          subscriptionsRef.current.userChannel = null;
        }
        
        // Set up a global subscription for the user to track all message changes
        const userChannel = supabase
          .channel(userChannelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'chat_messages',
              filter: `receiver_id=eq.${user.id}`
            },
            (payload) => {
              console.log('New message received for user:', payload);
              // Always refetch both messages and contacts on new message
              refetchMessages();
              
              // Staggered refetches for contacts to ensure UI is updated
              setTimeout(() => refetchContacts(), 100);
              setTimeout(() => refetchContacts(), 1000);
              setTimeout(() => refetchContacts(), 3000);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'chat_messages',
              filter: `receiver_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Message updated for user (read status):', payload);
              // Force refetch contacts AND messages to ensure everything is in sync
              refetchMessages();
              
              // Staggered refetches for contacts
              setTimeout(() => refetchContacts(), 100);
              setTimeout(() => refetchContacts(), 1000);
              setTimeout(() => refetchContacts(), 3000);
            }
          )
          .subscribe((status) => {
            console.log(`User channel subscription status for ${userChannelName}:`, status);
            
            // If subscription failed, try again unless we've exceeded max attempts
            if (status === 'CHANNEL_ERROR' && setupAttemptsRef.current.userChannel < 3) {
              setupAttemptsRef.current.userChannel++;
              console.log(`Retrying user channel setup (attempt ${setupAttemptsRef.current.userChannel})`);
              setTimeout(setupUserChannel, 1000 * setupAttemptsRef.current.userChannel);
            }
          });
          
        subscriptionsRef.current.userChannel = userChannel;
      } catch (err) {
        console.error("Error setting up user subscription:", err);
        
        // Retry with backoff unless we've exceeded max attempts
        if (setupAttemptsRef.current.userChannel < 3) {
          setupAttemptsRef.current.userChannel++;
          console.log(`Will retry user subscription setup in ${1000 * setupAttemptsRef.current.userChannel}ms`);
          setTimeout(setupUserChannel, 1000 * setupAttemptsRef.current.userChannel);
        }
      }
    };
    
    // Set up user channel
    setupUserChannel();
    
    // Also set up specific conversation subscription if a contact is selected
    const setupConversationChannel = () => {
      if (!selectedContact?.conversation_id) return;
      
      try {
        // Remove any existing conversation channel
        if (subscriptionsRef.current.conversationChannel) {
          console.log("Removing existing conversation channel subscription");
          supabase.removeChannel(subscriptionsRef.current.conversationChannel);
          subscriptionsRef.current.conversationChannel = null;
        }
        
        // Create unique channel name with random component to avoid conflicts
        const channelName = `conversation-${selectedContact.conversation_id}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        console.log(`Setting up conversation subscription for ${channelName}`);
        
        const conversationChannel = supabase
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
              console.log('New message received in conversation:', payload);
              refetchMessages();
              
              // Staggered refetches
              setTimeout(() => refetchContacts(), 100);
              setTimeout(() => refetchContacts(), 1000);
              setTimeout(() => refetchContacts(), 3000);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE', 
              schema: 'public',
              table: 'chat_messages',
              filter: `conversation_id=eq.${selectedContact.conversation_id}`
            },
            (payload) => {
              console.log('Message updated in conversation:', payload);
              refetchMessages();
              
              // Staggered refetches
              setTimeout(() => refetchContacts(), 100);
              setTimeout(() => refetchContacts(), 1000);
              setTimeout(() => refetchContacts(), 3000);
            }
          )
          .subscribe((status) => {
            console.log(`Conversation subscription status for ${channelName}:`, status);
            
            // If subscription failed, retry unless we've exceeded max attempts
            if (status === 'CHANNEL_ERROR' && setupAttemptsRef.current.conversationChannel < 3) {
              setupAttemptsRef.current.conversationChannel++;
              console.log(`Retrying conversation channel setup (attempt ${setupAttemptsRef.current.conversationChannel})`);
              setTimeout(setupConversationChannel, 1000 * setupAttemptsRef.current.conversationChannel);
            }
          });
          
        subscriptionsRef.current.conversationChannel = conversationChannel;
      } catch (err) {
        console.error("Error setting up conversation subscription:", err);
        
        // Retry with backoff unless we've exceeded max attempts
        if (setupAttemptsRef.current.conversationChannel < 3) {
          setupAttemptsRef.current.conversationChannel++;
          console.log(`Will retry conversation subscription setup in ${1000 * setupAttemptsRef.current.conversationChannel}ms`);
          setTimeout(setupConversationChannel, 1000 * setupAttemptsRef.current.conversationChannel);
        }
      }
    };
    
    // Set up conversation channel if we have a selected contact
    if (selectedContact?.conversation_id) {
      // Reset attempt counter when contact changes
      setupAttemptsRef.current.conversationChannel = 0;
      setupConversationChannel();
    }
    
    // Periodically check and reestablish subscriptions if needed
    const checkSubscriptionsInterval = setInterval(() => {
      // Check user channel
      if (!subscriptionsRef.current.userChannel && setupAttemptsRef.current.userChannel < 3) {
        console.log("User channel subscription not found, attempting to reestablish");
        setupUserChannel();
      }
      
      // Check conversation channel
      if (selectedContact?.conversation_id && 
          !subscriptionsRef.current.conversationChannel && 
          setupAttemptsRef.current.conversationChannel < 3) {
        console.log("Conversation channel subscription not found, attempting to reestablish");
        setupConversationChannel();
      }
    }, 30000); // Check every 30 seconds
    
    // Cleanup function
    return () => {
      try {
        console.log(`Removing user channel ${userChannelName}`);
        if (subscriptionsRef.current.userChannel) {
          supabase.removeChannel(subscriptionsRef.current.userChannel);
          subscriptionsRef.current.userChannel = null;
        }
        
        if (subscriptionsRef.current.conversationChannel) {
          console.log(`Removing conversation channel for ${selectedContact?.conversation_id}`);
          supabase.removeChannel(subscriptionsRef.current.conversationChannel);
          subscriptionsRef.current.conversationChannel = null;
        }
        
        clearInterval(checkSubscriptionsInterval);
      } catch (err) {
        console.error("Error cleaning up channels:", err);
      }
    };
  }, [user, selectedContact?.conversation_id, refetchMessages, refetchContacts]);
  
  return {};
};
